import BuffContainer from '@shared/models/BuffContainer'
import ServerBuff from './ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerCard from './ServerCard'
import OutgoingCardUpdateMessages from '../handlers/outgoing/OutgoingCardUpdateMessages'

export default class ServerBuffContainer implements BuffContainer {
	readonly card: ServerCard
	readonly buffs: ServerBuff[]

	constructor(card: ServerCard) {
		this.card = card
		this.buffs = []
	}

	private instantiate(buff: ServerBuff, source: ServerCard | null): ServerBuff {
		buff.card = this.card
		buff.game = this.card.game
		buff.source = source
		buff.duration = buff.baseDuration
		buff.intensity = buff.baseIntensity
		buff.buffClass = buff.constructor.name.substr(0, 1).toLowerCase() + buff.constructor.name.substr(1)

		return buff
	}

	/*
	 * Duration ticks down at the end of every turn:
	 * - Duration 1 = 'until the end of this turn'
	 * - Duration 2 = 'until the start of your next turn'
	 * Default value is Infinity, i.e. buffs never expire
	 */
	public add(prototype: ServerBuff, source: ServerCard | null, duration: number | 'default' = 'default'): void {
		const newBuff = this.instantiate(prototype, source)
		if (duration !== 'default') {
			newBuff.duration = duration
		}

		const existingBuff = this.buffs.find(existingBuff => existingBuff.buffClass === newBuff.buffClass)
		if (existingBuff && newBuff.stackType === BuffStackType.ADD_DURATION) {
			existingBuff.duration += newBuff.duration
			runCardEventHandler(() => existingBuff.onDurationChanged(newBuff.duration))
			OutgoingCardUpdateMessages.notifyAboutCardBuffDurationChanged(this.card, existingBuff)
			return
		} else if (existingBuff && newBuff.stackType === BuffStackType.ADD_INTENSITY) {
			existingBuff.intensity += newBuff.intensity
			runCardEventHandler(() => existingBuff.onIntensityChanged(newBuff.intensity))
			return
		}

		if (newBuff.stackType === BuffStackType.NONE && existingBuff.duration < newBuff.duration) {
			this.buffs.splice(this.buffs.indexOf(existingBuff), 1)
		}

		this.buffs.push(newBuff)
		OutgoingCardUpdateMessages.notifyAboutCardBuffAdded(this.card, newBuff)
		runCardEventHandler(() => newBuff.onCreated())
		runCardEventHandler(() => newBuff.onDurationChanged(newBuff.duration))
		runCardEventHandler(() => newBuff.onIntensityChanged(newBuff.intensity))
	}

	public getBuffsByPrototype(prototype: any): ServerBuff[] {
		const buffClass = prototype.prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.prototype.constructor.name.substr(1)
		return this.buffs.filter(buff => buff.buffClass === buffClass)
	}

	public has(prototype: any): boolean {
		return this.getBuffsByPrototype(prototype).length > 0
	}

	public getIntensity(prototype: any): number {
		return this.getBuffsByPrototype(prototype).map(buff => buff.intensity).reduce((total, value) => total + value, 0)
	}

	public removeByReference(buff: ServerBuff): void {
		this.buffs.splice(this.buffs.indexOf(buff), 1)
		OutgoingCardUpdateMessages.notifyAboutCardBuffRemoved(this.card, buff)
		runCardEventHandler(() => buff.onIntensityChanged(-buff.intensity))
		runCardEventHandler(() => buff.onDurationChanged(-buff.duration))
		runCardEventHandler(() => buff.onDestroyed())
	}

	public remove(prototype: any): void {
		const buffClass = prototype.constructor.name.substr(0, 1).toLowerCase() + prototype.constructor.name.substr(1)
		const buffsOfType = this.buffs.filter(buff => buff.buffClass === buffClass)
		buffsOfType.forEach(buffToRemove => {
			this.removeByReference(buffToRemove)
		})
	}

	public removeAll(): void {
		while (this.buffs.length > 0) {
			this.removeByReference(this.buffs[0])
		}
	}

	public onTurnStarted(): void {
		this.buffs.forEach(buff => {
			runCardEventHandler(() => buff.onTurnStarted())
			buff.addDuration(-1)
		})
	}

	public onTurnEnded(): void {
		this.buffs.forEach(buff => {
			runCardEventHandler(() => buff.onTurnEnded())
			buff.addDuration(-1)
		})
	}

	public onRoundEnded(): void {
		this.buffs.forEach(buff => {
			runCardEventHandler(() => buff.onRoundEnded())
		})
	}
}
