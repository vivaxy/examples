/**
 * @since 2019-04-23 11:14
 * @author vivaxy
 */

interface IPerson {
  job?: string;
}

function createPerson(person: IPerson): { job: string } {
  if (!person.job) {
    person.job = 'Self employed';
  }
  return person as { job: string };
}

createPerson({ }); // ok
createPerson({ job: 'Engineer' }); // ok
createPerson({ name: 'vivaxy' }); // Property 'name' does not exist on type 'IPerson'.

function createPersonWithError(person: IPerson) {
  if (person.name) { // Property 'name' does not exist on type 'IPerson'.
    delete person.name;
  }
}
