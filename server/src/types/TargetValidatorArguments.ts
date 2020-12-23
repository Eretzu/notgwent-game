import ServerBoardRow from '../game/models/ServerBoardRow'
import ServerCard from '../game/models/ServerCard'
import { ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from '../game/models/ServerCardTarget'
import ServerUnit from '../game/models/ServerUnit'

export interface CardTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	previousTargets?: (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[]
}

export interface UnitTargetValidatorArguments {
	sourceCard: ServerCard
	targetCard: ServerCard
	targetUnit: ServerUnit
	previousTargets?: (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[]
}

export interface RowTargetValidatorArguments {
	sourceCard: ServerCard
	targetRow: ServerBoardRow
	previousTargets?: (ServerCardTargetUnit | ServerCardTargetCard | ServerCardTargetRow)[]
}

type TargetValidatorArguments = CardTargetValidatorArguments | UnitTargetValidatorArguments | RowTargetValidatorArguments
export default TargetValidatorArguments
