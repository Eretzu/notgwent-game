import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import GameEventType from '@shared/enums/GameEventType'
import BuffAlignment from '@shared/enums/BuffAlignment'

export default class BuffStrength extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
		})

		this.createEffect(GameEventType.BUFF_CREATED).perform(() => this.onCreated())
	}

	private onCreated(): void {
		this.card.stats.power = this.card.stats.power + 1
	}

	getMaxPowerOverride(baseValue: number): number {
		return baseValue + 1
	}
}
