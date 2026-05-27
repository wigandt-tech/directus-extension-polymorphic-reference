// Test stub for `@directus/extensions-sdk` so unit tests can import the shared
// module without pulling the real app-only SDK into a Node test environment.
// Only the bindings referenced at module load are needed; the pure functions
// under test never call them.
export const useApi = () => ({
	get: async () => ({ data: { data: {} } }),
});

export const useStores = () => ({});
