import path from 'path'
import glob from 'glob'
import ServerCard from '../models/ServerCard'
import ServerGame from '../models/ServerGame'
import VoidGame from '../utils/VoidGame'
import { colorize } from '../../utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import * as fs from 'fs'
import CardColor from '@shared/enums/CardColor'
import CardType from '@shared/enums/CardType'

interface CardConstructor {
	new (game: ServerGame): ServerCard
}

class CardLibrary {
	cards: ServerCard[]

	constructor() {
		const normalizedPath = path.join(__dirname, '../cards')
		const cardDefinitionFiles = glob.sync(`${normalizedPath}/**/*.js`)
		const cardModules = cardDefinitionFiles.map(path => ({
			path: path,
			filename: path.substring(path.lastIndexOf('/') + 1, path.indexOf('.js')),
			timestamp: fs.statSync(path).mtimeMs,
			prototypeFunction: require(path).default
		}))
		console.info(`Found ${colorize(cardModules.length, AsciiColor.CYAN)} card definition files`)

		const nameMismatchModules = cardModules.filter(module => module.filename !== module.prototypeFunction.name)
		if (nameMismatchModules.length > 0) {
			const errorArray = nameMismatchModules.map(module => ({
				file: module.filename,
				prototype: module.prototypeFunction.name
			}))
			console.warn(colorize(`Clearing ${nameMismatchModules.length} card module(s) due to class name mismatch:`, AsciiColor.YELLOW), errorArray)
			nameMismatchModules.forEach(module => fs.unlinkSync(module.path))
		}

		const filteredModules = cardModules
			.filter(module => module.filename === module.prototypeFunction.name)
			.reduce((acc, obj) => {
				const updatedArray = acc.slice()
				const savedObject = updatedArray.find(savedObject => savedObject.filename === obj.filename)
				if (!savedObject) {
					updatedArray.push(obj)
				} else if (obj.timestamp > savedObject.timestamp) {
					updatedArray.splice(updatedArray.indexOf(savedObject), 1, obj)
				}
				return updatedArray
			}, [])

		const outdatedModules = cardModules.filter(module => !filteredModules.includes(module) && !nameMismatchModules.includes(module))
		if (outdatedModules.length > 0) {
			console.info(colorize(`Clearing ${outdatedModules.length} outdated card module(s)`, AsciiColor.YELLOW))
			outdatedModules.forEach(module => fs.unlinkSync(module.path))
		}

		const cardPrototypes = filteredModules.map(module => module.prototypeFunction)

		this.cards = cardPrototypes.map(prototype => {
			const referenceInstance = new prototype(VoidGame.get())
			const className = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
			referenceInstance.class = className
			referenceInstance.power = referenceInstance.basePower
			referenceInstance.armor = referenceInstance.baseArmor
			referenceInstance.attack = referenceInstance.baseAttack
			referenceInstance.name = `card.name.${className}`
			referenceInstance.description = `card.description.${className}`
			if ((referenceInstance.color === CardColor.LEADER || referenceInstance.color === CardColor.GOLDEN) && referenceInstance.type === CardType.UNIT) {
				referenceInstance.title = `card.title.${className}`
			}
			return referenceInstance
		})

		const sortedModules = filteredModules.sort((a, b) => b.timestamp - a.timestamp)
		const latestClasses = sortedModules.slice(0, 5).map(card => card.prototypeFunction.name)
		console.info(`Loaded ${colorize(cardPrototypes.length, AsciiColor.CYAN)} card definitions. Newest 5:`, latestClasses)
	}

	public get collectibleCards(): ServerCard[] {
		const cards = this.cards as ServerCard[]
		return cards.filter(card => card.isCollectible())
	}

	public findPrototypeById(id: string): ServerCard | null {
		return this.cards.find(card => card.id === id)
	}

	public instantiateByInstance(game: ServerGame, card: ServerCard): ServerCard {
		const cardClass = card.constructor.name.substr(0, 1).toLowerCase() + card.constructor.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByConstructor(game: ServerGame, prototype: Function): ServerCard {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.instantiateByClass(game, cardClass)
	}

	public instantiateByClass(game: ServerGame, cardClass: string): ServerCard {
		const reference = this.cards.find(card => {
			return card.class === cardClass
		})
		if (!reference) {
			console.error(`No registered card with class '${cardClass}'!`)
			throw new Error(`No registered card with class '${cardClass}'!`)
		}

		const referenceConstructor = reference.constructor as CardConstructor
		const clone: ServerCard = new referenceConstructor(game)
		clone.type = reference.type
		clone.class = cardClass

		clone.name = reference.name
		clone.title = reference.title
		clone.baseTribes = (reference.baseTribes || []).slice()
		clone.baseFeatures = (reference.baseFeatures || []).slice()
		clone.description = reference.description
		clone.game = game
		clone.power = clone.basePower
		clone.attack = clone.baseAttack
		clone.attackRange = clone.baseAttackRange
		clone.armor = clone.baseArmor
		return clone
	}
}

export default new CardLibrary()
