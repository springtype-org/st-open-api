import {resolve} from 'path'

export type IValidation<T> = (value: string) => T

export interface IOption<T> {
    shortCmd: string;
    longCmd: string;
    validator: IValidation<T>;
    description?: string;
    defaultValue?: any;
    required?: boolean;
}

export interface IFlag {
    shortCmd: string;
    longCmd: string;
    description?: string;
    enabled?: boolean;
}

export interface SortedInput {
    shortCommands: Array<Array<string>>;
    longCommands: Array<Array<string>>
}

export const extendString = (str: string, maxLength: number) => {
    for (let i = str.length; i <= maxLength; i++) {
        str += ' ';
    }
    return str;
}

export const sortInputs = (inputs: Array<string>): SortedInput => {
    const commands = [];
    let command = [];
    for (const input of inputs) {
        if (input.startsWith('-')) {
            commands.push(command);
            command = [];
        }
        command.push(input);
    }
    commands.push(command);

    const filteredCommands = commands.filter(c => c.length > 0);
    const shortCommands = [];
    const longCommands = [];

    filteredCommands.forEach(v => {
        if (v[0].startsWith('--')) {
            longCommands.push(v);
        } else {
            shortCommands.push(v);
        }
    });
    return {
        longCommands,
        shortCommands
    }
}

export class CLI {
    options: { [optionCmd: string]: IOption<any> } = {};
    flags: { [flagCmd: string]: IFlag } = {};

    _version: string = '';
    _description: string = '';

    constructor(private name: string) {
        this.flag({shortCmd: 'h', longCmd: 'help', description: 'display help for command'})
    }

    version(version: string) {
        this._version = version;
        this.flag({shortCmd: 'v', longCmd: 'version', description: 'output the current version'})
        return this;
    }

    description(description: string) {
        this._description = description;
        return this;
    }

    flag(flag: IFlag): CLI {
        this.flags[flag.longCmd] = flag;
        return this;
    }

    option<T>(option: IOption<T>): CLI {
        this.options[option.longCmd] = option;
        return this;
    }

    printHelp() {
        console.log('Usage:', this.name, this._version, '\n')

        if (!!this._description) {
            console.log(this._description, '\n')
        }

        console.log('Options:')
        const flags = Object.keys(this.flags).map(optionOrFlagKey => {
            const option = this.flags[optionOrFlagKey];
            return {
                commands: `  -${option.shortCmd}, --${option.longCmd}    `,
                description: `${option.description} (default: ${typeof option.enabled === 'undefined' ? 'disabled' : 'enabled'})`
            }
        })

        const options = Object.keys(this.options).map(optionOrFlagKey => {
            const option = this.options[optionOrFlagKey];
            return {
                commands: `  -${option.shortCmd}, --${option.longCmd}    `,
                description: `${option.description}  ${typeof option.defaultValue === 'undefined' ? '' : `(default: ${option.defaultValue})`}`
            }
        })

        const commands = [...flags, ...options];
        const length = commands.map(c => c.commands.length).reduce((previousValue, currentValue) => {
            return previousValue > currentValue
                ? previousValue : currentValue
        })

        commands.forEach(({commands, description}) =>
            console.log(`${extendString(commands, length)}${description}`)
        )
    }

    action() {
        if (process.argv.length <= 2) {
            this.printHelp();
        } else {
            //parse input
            const inputs = process.argv.slice(2);
            const sortedInputs = sortInputs(inputs);

            console.log('sorted inputs', sortedInputs);

            const selectedFlags = Object.values(this.flags).filter((flag) =>
                sortedInputs.shortCommands.map(v => v[0]).indexOf('-'+flag.shortCmd)> -1
                || sortedInputs.longCommands.map(v => v[0]).indexOf('-'+flag.longCmd)> -1
            , [])
            console.log(selectedFlags);


        }
    }
}

(() => {
    const cli = new CLI('st-open-api')
        .version('2.3.4') // TODO: use version from package.json
        .description('the test project description')
        .option<string>({
            shortCmd: 't',
            longCmd: 'test',
            description: 'thats a test description',
            validator: (value: string) => resolve(process.cwd(), value),
        });

    cli.action();
})()
