import CardFeature from '../../../enums/CardFeature'
import CardTribe from '../../../enums/CardTribe'
import BuffFeature from '../../../enums/BuffFeature'
import BuffAlignment from '../../../enums/BuffAlignment'

export default interface BuffMessage {
	id: string
	cardId: string
	class: string
	sourceId: string | null
	alignment: BuffAlignment
	cardTribes: CardTribe[]
	buffFeatures: BuffFeature[]
	cardFeatures: CardFeature[]

	name: string
	description: string

	duration: string
	baseDuration: string

	protected: boolean
}
