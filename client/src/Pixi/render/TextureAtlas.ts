import axios from 'axios'
import * as PIXI from 'pixi.js'
import store from '@/Vue/store'
import CardMessage from '@shared/models/network/CardMessage'

export default class TextureAtlas {
	static isReady = false
	static isLoading = false
	static texturesLoaded: number
	static texturesToLoad: number
	static textures: { [ index: string ]: PIXI.Texture }

	static resolveFunctions: { (): void }[] = []

	public static async prepare(): Promise<void> {
		return new Promise(async (resolve) => {
			if (TextureAtlas.isReady) {
				resolve()
				return
			}

			TextureAtlas.resolveFunctions.push(resolve)
			if (TextureAtlas.isLoading || !store.state.isLoggedIn) {
				return
			}

			this.isLoading = true
			TextureAtlas.texturesLoaded = 0
			TextureAtlas.textures = {}

			const components = [
				'effects/trail',
				'effects/fireball-static',
				'cards/cardBack',
				'components/bg-power',
				'components/bg-power-zoom',
				'components/bg-manacost',
				'components/bg-name',
				'components/bg-tribe',
				'components/bg-description-top',
				'components/bg-description-middle-short',
				'components/bg-description-middle-long',
				'components/bg-description-bottom',
				'components/bg-stats-left',
				'components/bg-stats-middle',
				'components/bg-stats-right',
				'components/bg-stats-right-zoom',
				'components/bg-overlay-unit-bronze',
				'components/bg-overlay-unit-silver',
				'components/bg-overlay-unit-golden',
				'components/bg-overlay-spell',
				'components/stat-attack-claw',
				'components/stat-attack-range',
				'components/stat-health-armor',
				'components/overlay-move',
				'board/board-row'
			]

			const response = await axios.get('/api/cards')
			const cardMessages: CardMessage[] = response.data
			const cards = cardMessages.map(cardMessage => {
				const name = cardMessage.class.substr(0, 1).toLowerCase() + cardMessage.class.substr(1)
				return `cards/${name}`
			})

			const texturesToLoad = components.concat(cards)

			TextureAtlas.texturesToLoad = texturesToLoad.length

			texturesToLoad.forEach(fileName => {
				const texture = PIXI.Texture.from(`assets/${fileName}.png`)

				const onLoaded = () => {
					TextureAtlas.texturesLoaded += 1
					TextureAtlas.textures[fileName.toLowerCase()] = texture

					if (TextureAtlas.texturesLoaded >= TextureAtlas.texturesToLoad) {
						console.info(`TextureAtlas initialized. Resolving ${TextureAtlas.resolveFunctions.length} promise(s).`)
						TextureAtlas.onReady()
					}
				}
				texture.baseTexture.on('loaded', onLoaded)
				texture.baseTexture.on('error', () => {
					console.error(`Unable to load texture ${fileName}`)
					onLoaded()
				})
			})
		})
	}

	private static onReady(): void {
		this.isReady = true
		this.resolveFunctions.forEach(resolve => resolve())
	}

	public static getTexture(path: string): PIXI.Texture {
		path = path.toLowerCase()
		if (!this.isReady) {
			throw new Error(`Accessing texture at '${path}' before TextureAtlas is ready!`)
		}
		const texture = this.textures[path]
		if (!texture) {
			console.warn(`No texture available at '${path}'`)
		}
		return this.textures[path]
	}
}
