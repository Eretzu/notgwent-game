import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetTypeWithMode from '../../../types/TargetTypeWithMode'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import TargetDefinition from './TargetDefinition'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'

export default class StandardTargetDefinitionBuilder implements TargetDefinitionBuilder {
	private readonly game: ServerGame
	private totalTargetCount: number = undefined
	private readonly orderLabels: string[][]
	private readonly targetOfTypeCount: number[][]
	private readonly validators: ((args: TargetValidatorArguments) => boolean)[][][] = []
	private readonly evaluators: ((args: TargetValidatorArguments) => number)[][][] = []

	constructor(game: ServerGame) {
		this.game = game
		this.validators = []
		this.evaluators = []
		this.orderLabels = []
		this.targetOfTypeCount = []
		for (const targetingReason in Object.values(TargetMode)) {
			this.orderLabels[targetingReason] = []
			this.targetOfTypeCount[targetingReason] = []
			this.validators[targetingReason] = []
			this.evaluators[targetingReason] = []
			for (const targetType in Object.values(TargetType)) {
				this.orderLabels[targetingReason][targetType] = ''
				this.targetOfTypeCount[targetingReason][targetType] = 0
				this.validators[targetingReason][targetType] = []
				this.evaluators[targetingReason][targetType] = []
			}
		}
	}

	public build(): TargetDefinition {
		return new TargetDefinition(this.game, this.totalTargetCount, this.orderLabels, this.targetOfTypeCount, this.validators, this.evaluators)
	}

	public singleTarget(): StandardTargetDefinitionBuilder {
		this.totalTargetCount = 1
		return this
	}

	public singleAction(): StandardTargetDefinitionBuilder {
		this.totalTargetCount = 1
		return this
	}

	public multipleTargets(count: number): StandardTargetDefinitionBuilder {
		this.totalTargetCount = count
		return this
	}

	public actions(count: number): StandardTargetDefinitionBuilder {
		this.totalTargetCount = count
		return this
	}

	public label(reason: TargetMode, type: TargetType, label: string): StandardTargetDefinitionBuilder {
		this.orderLabels[reason][type] = label
		return this
	}

	public allow(reason: TargetMode, type: TargetType, atMost = 1): StandardTargetDefinitionBuilder {
		this.targetOfTypeCount[reason][type] = atMost
		if (this.totalTargetCount === undefined) {
			this.totalTargetCount = atMost
		}
		return this
	}

	public require(reason: TargetMode, type: TargetType, number = 1): StandardTargetDefinitionBuilder {
		this.targetOfTypeCount[reason][type] = number
		if (this.totalTargetCount === undefined) {
			this.totalTargetCount = number
		}
		return this
	}

	public validate(reason: TargetMode, type: TargetType, validator: (args: TargetValidatorArguments) => boolean): StandardTargetDefinitionBuilder {
		this.validators[reason][type].push(validator)
		return this
	}

	public evaluate(reason: TargetMode, type: TargetType, evaluator: (args: TargetValidatorArguments) => number): StandardTargetDefinitionBuilder {
		this.evaluators[reason][type].push(evaluator)
		return this
	}

	public unique(targetMode: TargetMode, targetType: TargetType): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, targetType, args => {
			const applicablePreviousTargets = args.previousTargets.filter(target => target.targetMode === targetMode && target.targetType === targetType)
			return (!args.targetCard || !applicablePreviousTargets.find(target => target.targetCard === args.targetCard)) &&
				(!args.targetUnit || !applicablePreviousTargets.find(target => target.targetUnit === args.targetUnit)) &&
				(!args.targetRow || !applicablePreviousTargets.find(target => target.targetRow === args.targetRow))
		})
	}

	public inStaticRange(targetMode: TargetMode, targetType: TargetType, range: number): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, targetType, args => {
			const thisUnit = args.thisUnit
			const rowIndex = targetType === TargetType.UNIT ? args.targetUnit.rowIndex : args.targetRow.index
			return Math.abs(thisUnit.rowIndex - rowIndex) <= range
		})
	}

	public alliedUnit(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.UNIT, args => {
			return (args.thisCardOwner && args.thisCardOwner === args.targetUnit.owner) || (args.thisUnit && args.thisUnit.owner === args.targetUnit.owner)
		})
	}

	public enemyUnit(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.UNIT, args => {
			return (args.thisCardOwner && args.thisCardOwner !== args.targetUnit.owner) || (args.thisUnit && args.thisUnit.owner !== args.targetUnit.owner)
		})
	}

	public playersRow(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.BOARD_ROW, args => {
			return args.targetRow.owner === args.thisCard.owner
		})
	}

	public opponentsRow(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.BOARD_ROW, args => {
			return args.targetRow.owner === args.thisCard.owner.opponent
		})
	}

	public emptyRow(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length === 0
		})
	}

	public notEmptyRow(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.BOARD_ROW, args => {
			return args.targetRow.cards.length > 0
		})
	}

	public notSelf(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.UNIT, args => {
			return !args.thisUnit || args.thisUnit !== args.targetUnit
		})
	}

	public inPlayersHand(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner === args.thisCardOwner
		}).validate(targetMode, TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner === args.thisCardOwner
		})
	}

	public inOpponentsHand(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.CARD_IN_UNIT_HAND, args => {
			return args.targetCard.owner !== args.thisCardOwner
		}).validate(targetMode, TargetType.CARD_IN_SPELL_HAND, args => {
			return args.targetCard.owner !== args.thisCardOwner
		})
	}

	public inPlayersDeck(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner === args.thisCardOwner
		}).validate(targetMode, TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner === args.thisCardOwner
		})
	}

	public inOpponentsDeck(targetMode: TargetMode): StandardTargetDefinitionBuilder {
		return this.validate(targetMode, TargetType.CARD_IN_UNIT_DECK, args => {
			return args.targetCard.owner !== args.thisCardOwner
		}).validate(targetMode, TargetType.CARD_IN_SPELL_DECK, args => {
			return args.targetCard.owner !== args.thisCardOwner
		})
	}

	public merge(targetDefinition: StandardTargetDefinitionBuilder): StandardTargetDefinitionBuilder {
		this.totalTargetCount += targetDefinition.totalTargetCount
		for (const targetingReason in Object.values(TargetMode)) {
			for (const targetType in Object.values(TargetType)) {
				this.targetOfTypeCount[targetingReason][targetType] += targetDefinition.targetOfTypeCount[targetingReason][targetType]
				this.orderLabels[targetingReason][targetType] = this.orderLabels[targetingReason][targetType] || targetDefinition.orderLabels[targetingReason][targetType]
				this.validators[targetingReason][targetType] = this.validators[targetingReason][targetType].concat(targetDefinition.validators[targetingReason][targetType])
			}
		}
		return this
	}

	public static base(game: ServerGame): StandardTargetDefinitionBuilder {
		return new StandardTargetDefinitionBuilder(game)
			.label(TargetMode.POST_PLAY_REQUIRED_TARGET, TargetType.UNIT, 'target.generic.unit')
			.label(TargetMode.POST_PLAY_REQUIRED_TARGET, TargetType.BOARD_ROW, 'target.generic.row')
			.label(TargetMode.ORDER_ATTACK, TargetType.UNIT, 'target.attack.unit')
			.label(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW, 'target.attack.row')
			.label(TargetMode.ORDER_DRAIN, TargetType.UNIT, 'target.drain.unit')
			.label(TargetMode.ORDER_DRAIN, TargetType.BOARD_ROW, 'target.drain.row')
			.label(TargetMode.ORDER_SUPPORT, TargetType.UNIT, 'target.support.unit')
			.label(TargetMode.ORDER_SUPPORT, TargetType.BOARD_ROW, 'target.support.row')
			.label(TargetMode.ORDER_MOVE, TargetType.BOARD_ROW, 'target.move.row')
	}
}
