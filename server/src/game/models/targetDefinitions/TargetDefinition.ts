import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetTypeWithMode from '../../../types/TargetTypeWithMode'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import Constants from '@shared/Constants'
import CardType from '@shared/enums/CardType'

export default class TargetDefinition {
	private readonly game: ServerGame
	private readonly totalTargetCount: number
	private readonly orderLabels: string[][]
	private readonly targetOfTypeCount: number[][]
	private readonly validators: ((args: TargetValidatorArguments) => boolean)[][][] = []
	private readonly evaluators: ((args: TargetValidatorArguments) => number)[][][] = []

	constructor(game: ServerGame,
		totalTargetCount: number,
		orderLabels: string[][],
		targetOfTypeCount: number[][],
		validators: ((args: TargetValidatorArguments) => boolean)[][][],
		evaluators: ((args: TargetValidatorArguments) => number)[][][]) {
		this.game = game
		this.totalTargetCount = totalTargetCount
		this.orderLabels = orderLabels
		this.targetOfTypeCount = targetOfTypeCount
		this.validators = validators
		this.evaluators = evaluators
	}

	public getTargetCount(): number {
		return this.totalTargetCount
	}

	public getOrderLabel(reason: TargetMode, type: TargetType): string {
		return this.orderLabels[reason][type]
	}

	public getTargetOfTypeCount(targetMode: TargetMode, targetType: TargetType): number {
		return this.targetOfTypeCount[targetMode][targetType]
	}

	public validate(reason: TargetMode, type: TargetType, args: TargetValidatorArguments): boolean {
		return this.validators[reason][type].every(validator => validator(args))
	}

	public evaluate(reason: TargetMode, type: TargetType, args: TargetValidatorArguments): number {
		return this.evaluators[reason][type].reduce((acc, evaluator) => acc + evaluator(args), 0)
	}

	public static none(game: ServerGame): StandardTargetDefinitionBuilder {
		return new StandardTargetDefinitionBuilder(game)
	}

	public static defaultUnitOrder(game: ServerGame): StandardTargetDefinitionBuilder {
		return StandardTargetDefinitionBuilder.base(game)
			.validate(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, (args: TargetValidatorArguments) => {
				const thisUnit = args.thisUnit
				const targetRow = args.targetRow!

				const distanceToRow = Math.abs(thisUnit.rowIndex - targetRow.index)
				const rowIsFull = targetRow.cards.length >= Constants.MAX_CARDS_PER_ROW

				return distanceToRow === 1 && !rowIsFull && targetRow.owner === thisUnit.owner
			})
			.validate(TargetMode.ORDER_ATTACK, TargetType.UNIT, (args: TargetValidatorArguments) => {
				const thisUnit = args.thisUnit
				const targetUnit = args.targetUnit!
				return targetUnit.owner === game.getOpponent(thisUnit.owner)
			})
	}

	public static defaultCardPlayTarget(game: ServerGame): StandardTargetDefinitionBuilder {
		return StandardTargetDefinitionBuilder.base(game)
			.actions(1)
			.allow(TargetMode.ON_PLAY_VALID_TARGET, TargetType.BOARD_ROW)
			.validate(TargetMode.ON_PLAY_VALID_TARGET, TargetType.BOARD_ROW, (args: TargetValidatorArguments) => {
				if (args.thisCard.class === 'unitFlameTouchCrystal') {
				}
				return args.thisCard.type === CardType.SPELL || args.targetRow.owner === args.thisCardOwner
			})
	}
}
