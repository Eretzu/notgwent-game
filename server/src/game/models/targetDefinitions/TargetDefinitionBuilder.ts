import ServerTargetDefinition from './ServerTargetDefinition'

export default interface TargetDefinitionBuilder {
	build(): ServerTargetDefinition
}