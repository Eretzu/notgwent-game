import uuidv4 from 'uuid/v4'
import Buff from '@shared/models/Buff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerUnit from './ServerUnit'
import TargetDefinitionBuilder from './targetDefinitions/TargetDefinitionBuilder'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import ServerBoardRow from './ServerBoardRow'
import ServerDamageInstance from './ServerDamageSource'

export default class ServerBuff implements Buff {
	id: string
	game: ServerGame
	card: ServerCard
	source: ServerCard | null
	buffClass: string
	stackType: BuffStackType

	duration: number
	intensity: number
	baseDuration: number
	baseIntensity: number

	constructor(stackType: BuffStackType) {
		this.id = uuidv4()
		this.stackType = stackType
		this.baseDuration = Infinity
		this.baseIntensity = 1
	}

	protected get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.card.id)
	}

	public addDuration(delta: number): void {
		this.setDuration(this.duration + delta)
	}

	public setDuration(value: number): void {
		this.duration = value
		console.log(`Remaining duration: ${this.duration}`)
		if (this.duration <= 0) {
			console.log('Removing')
			this.card.buffs.removeByReference(this)
		}
	}

	public addIntensity(delta: number): void {
		this.setIntensity(this.intensity + delta)
	}

	public setIntensity(value: number): void {
		this.intensity = value
		if (this.intensity <= 0) {
			this.card.buffs.removeByReference(this)
		}
	}

	onCreated(): void { return }
	onDurationChanged(delta: number): void { return }
	onIntensityChanged(delta: number): void { return }
	onTurnStarted(): void { return }
	onTurnEnded(): void { return }
	getDamageTaken(thisUnit: ServerUnit, damage: number, damageSource: ServerDamageInstance): number { return damage }
	getDamageReduction(thisUnit: ServerUnit, damage: number, damageSource: ServerDamageInstance): number { return 0 }
	onBeforeBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onAfterBeingAttacked(thisUnit: ServerUnit, attacker: ServerUnit): void { return }
	onBeforePerformingMove(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onPerformingUnitSupport(thisUnit: ServerUnit, target: ServerUnit): void { return }
	onPerformingRowSupport(thisUnit: ServerUnit, target: ServerBoardRow): void { return }
	onBeforeBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }
	onAfterBeingSupported(thisUnit: ServerUnit, support: ServerUnit): void { return }
	onDestroyed(): void { return }

	definePlayValidTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	defineValidOrderTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePostPlayRequiredTargetsMod(): TargetDefinitionBuilder { return TargetDefinition.none(this.game) }
	definePlayValidTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	defineValidOrderTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
	definePostPlayRequiredTargetsOverride(targetDefinition: TargetDefinitionBuilder): TargetDefinitionBuilder { return targetDefinition }
}
