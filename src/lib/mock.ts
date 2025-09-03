export async function loadMock<T>(mockFile: string): Promise<T> {
    const data = await import(`@/data/${mockFile}`);
    return data.default as T;
}
