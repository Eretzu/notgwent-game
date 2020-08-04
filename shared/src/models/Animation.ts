import AnimationType from '../enums/AnimationType'
import Unit from './Unit'
import Card from './Card'

export default class Animation {
	type: AnimationType
	sourceCard: Card | null
	sourceUnit: Unit | null
	targetCard: Card | null
	targetCards: Card[] | null
	params: any

	constructor(type: AnimationType, params: any) {
		this.type = type
		this.params = params
	}
}
