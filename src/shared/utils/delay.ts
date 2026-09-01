export async function delay(milliseconds = 40): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, milliseconds))
}
