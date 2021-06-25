/**
 * @since 2021-06-24
 * @author vivaxy
 */
function renderSharedTypeData($parent, sharedType) {
  if (!sharedType) {
    return;
  }

  const $sharedType = document.createElement('div');
  $sharedType.classList.add('shared-type');
  $sharedType.classList.add(sharedType.content.str ? 'insert' : 'delete');

  const $clock = document.createElement('p');
  $clock.classList.add('clock');
  $clock.textContent = sharedType.id.clock;

  const $content = document.createElement('p');
  $content.classList.add('shared-type-value');
  $content.textContent = sharedType.content.str || sharedType.content.len;

  $sharedType.appendChild($clock);
  $sharedType.appendChild($content);

  $parent.appendChild($sharedType);

  renderSharedTypeData($parent, sharedType.right);
}

function renderClientData($parent, clientId, firstSharedType) {
  const $client = document.createElement('div');
  $client.classList.add('client');

  const $clientId = document.createElement('p');
  $clientId.classList.add('client-id');
  $clientId.textContent = `clientID: ${clientId}`;

  const $content = document.createElement('div');
  $content.classList.add('client-content');

  renderSharedTypeData($content, firstSharedType);

  $client.appendChild($clientId);
  $client.appendChild($content);

  $parent.appendChild($client);
}

export default function renderYDocData($parent, yDoc) {
  $parent.innerHTML = '';

  yDoc.store.clients.forEach(function (items, clientId) {
    renderClientData($parent, clientId, items[0].parent._start);
  });
}
