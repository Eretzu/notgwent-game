import ServerGame from '../ServerGame'
import TargetValidatorArguments from '../../../types/TargetValidatorArguments'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import StandardTargetDefinitionBuilder from './StandardTargetDefinitionBuilder'
import TargetDefinitionBuilder from './TargetDefinitionBuilder'
import TargetDefinition from './TargetDefinition'

export default class SimpleTargetDefinitionBuilder implements TargetDefinitionBuilder {
	builder: StandardTargetDefinitionBuilder
	targetMode: TargetMode

	public build(): TargetDefinition {
		return this.builder.build()
	}

	public singleTarget(): SimpleTargetDefinitionBuilder {
		this.builder.singleTarget()
		return this
	}

	public multipleTargets(count: number): SimpleTargetDefinitionBuilder {
		this.builder.multipleTargets(count)
		return this
	}

	public label(type: TargetType, label: string): SimpleTargetDefinitionBuilder {
		this.builder.label(this.targetMode, type, label)
		return this
	}

	public allow(type: TargetType, atMost = 1): SimpleTargetDefinitionBuilder {
		this.builder.allow(this.targetMode, type, atMost)
		return this
	}

	public require(type: TargetType, number = 1): SimpleTargetDefinitionBuilder {
		this.builder.require(this.targetMode, type, number)
		return this
	}

	public validate(type: TargetType, validator: (args: TargetValidatorArguments) => boolean): SimpleTargetDefinitionBuilder {
		this.builder.validate(this.targetMode, type, validator)
		return this
	}

	public evaluate(type: TargetType, evaluator: (args: TargetValidatorArguments) => number): SimpleTargetDefinitionBuilder {
		this.builder.evaluate(this.targetMode, type, evaluator)
		return this
	}

	public unique(targetType: TargetType): SimpleTargetDefinitionBuilder {
		this.builder.unique(this.targetMode, targetType)
		return this
	}

	public inStaticRange(targetType: TargetType, range: number): SimpleTargetDefinitionBuilder {
		this.builder.inStaticRange(this.targetMode, targetType, range)
		return this
	}

	public alliedUnit(): SimpleTargetDefinitionBuilder {
		this.builder.alliedUnit(this.targetMode)
		return this
	}

	public enemyUnit(): SimpleTargetDefinitionBuilder {
		this.builder.enemyUnit(this.targetMode)
		return this
	}

	public playersRow(): SimpleTargetDefinitionBuilder {
		this.builder.playersRow(this.targetMode)
		return this
	}

	public opponentsRow(): SimpleTargetDefinitionBuilder {
		this.builder.opponentsRow(this.targetMode)
		return this
	}

	public emptyRow(): SimpleTargetDefinitionBuilder {
		this.builder.emptyRow(this.targetMode)
		return this
	}

	public notEmptyRow(): SimpleTargetDefinitionBuilder {
		this.builder.notEmptyRow(this.targetMode)
		return this
	}

	public notSelf(): SimpleTargetDefinitionBuilder {
		this.builder.notSelf(this.targetMode)
		return this
	}

	public inPlayersHand(): SimpleTargetDefinitionBuilder {
		this.builder.inPlayersHand(this.targetMode)
		return this
	}

	public inOpponentsHand(): SimpleTargetDefinitionBuilder {
		this.builder.inOpponentsHand(this.targetMode)
		return this
	}

	public inPlayersDeck(): SimpleTargetDefinitionBuilder {
		this.builder.inPlayersDeck(this.targetMode)
		return this
	}

	public inOpponentsDeck(): SimpleTargetDefinitionBuilder {
		this.builder.inOpponentsDeck(this.targetMode)
		return this
	}

	public merge(targetDefinition: StandardTargetDefinitionBuilder): SimpleTargetDefinitionBuilder {
		this.builder.merge(targetDefinition)
		return this
	}

	public static base(game: ServerGame, targetMode: TargetMode): SimpleTargetDefinitionBuilder {
		const wrapper = new SimpleTargetDefinitionBuilder()
		wrapper.builder = StandardTargetDefinitionBuilder.base(game)
		wrapper.targetMode = targetMode
		return wrapper
	}
}
