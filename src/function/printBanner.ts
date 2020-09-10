import {resolve} from 'path'
import {readFileSync} from 'fs'

export const printBanner = () => {
    console.log('__dirname', __dirname)
    const banner = resolve(__dirname, '../banner.txt')
    console.log(readFileSync(banner, 'utf-8'))
}
