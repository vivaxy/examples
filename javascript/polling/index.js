/**
 * @since 2017-01-12 10:42
 * @author vivaxy
 */

let attempts = 0;

const polling = async(fetchParams, maxAttempts, interval) => {

    const msg = await fetch(fetchParams);
    attempts++;
    if (msg.code > 0) {
        return true;
    } else if (msg.code < 0) {
        throw new Error(`failed`);
    } else {
        if (attempts > maxAttempts) {
            throw new Error(`max attempts`);
        } else {
            await sleep(interval);
            return await poll();
        }
    }
};
