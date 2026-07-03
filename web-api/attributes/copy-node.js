var copyNode = function (source) {
  var tagName = source.tagName,
    attributes = source.attributes,
    destination = document.createElement(tagName);
  Array.prototype.slice.call(attributes).forEach(function (attr) {
    destination.setAttribute(attr.name, attr.value);
  });
  destination.innerHTML = source.innerHTML;
  return destination;
};
