export abstract class AbstractAction<Context> {
  abstract getName(): string;
  abstract run(context: Context): Promise<void>;
}
