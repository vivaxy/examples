/**
 * @since 2019-04-23 11:14
 * @author vivaxy
 */
function createPerson(person) {
    if (!person.job) {
        person.job = 'Self employed';
    }
    return person;
}
createPerson({}); // ok
createPerson({ job: 'Engineer' }); // ok
createPerson({ name: 'vivaxy' }); // Property 'name' does not exist on type 'IPerson'.
function createPersonWithError(person) {
    if (person.name) { // Property 'name' does not exist on type 'IPerson'.
        delete person.name;
    }
}
