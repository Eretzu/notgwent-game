import ServerBuff, { BuffConstructorParams } from '../models/ServerBuff'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffHiddenSpellDiscount extends ServerBuff {
	constructor(params: BuffConstructorParams) {
		super(params, {
			alignment: BuffAlignment.POSITIVE,
			features: [BuffFeature.SKIP_ANIMATION],
		})
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost - 1
	}
}
