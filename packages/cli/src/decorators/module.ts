import { Container, Service, type Constructable } from '@n8n/di';
import type { ExecutionLifecycleHooks } from 'n8n-core';

import type { MultiMainSetup } from '@/scaling/multi-main-setup.ee';

export interface BaseN8nModule {
	initialize?(): void;
	registerLifecycleHooks?(hooks: ExecutionLifecycleHooks): void;
	registerMultiMainListeners?(multiMainSetup: MultiMainSetup): void;
}

type Module = Constructable<BaseN8nModule>;

export const registry = new Set<Module>();

export const N8nModule = (): ClassDecorator => (target) => {
	registry.add(target as unknown as Module);

	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return Service()(target);
};

@Service()
export class ModuleRegistry {
	initializeModules() {
		for (const ModuleClass of registry.keys()) {
			const instance = Container.get(ModuleClass);
			if (instance.initialize) {
				instance.initialize();
			}
		}
	}

	registerLifecycleHooks(hooks: ExecutionLifecycleHooks) {
		for (const ModuleClass of registry.keys()) {
			const instance = Container.get(ModuleClass);
			if (instance.registerLifecycleHooks) {
				instance.registerLifecycleHooks(hooks);
			}
		}
	}

	registerMultiMainListeners(multiMainSetup: MultiMainSetup) {
		for (const ModuleClass of registry.keys()) {
			Container.get(ModuleClass).registerMultiMainListeners?.(multiMainSetup);
		}
	}
}
