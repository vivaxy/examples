/**
 * @since 2019-04-16 04:31
 * @author vivaxy
 */
function error(message: string): never {
    throw new Error(message)
}

function infiniteLoop(): never {
    while (true) {

    }
}

function fail(): never {
    return error('Some error')
}
