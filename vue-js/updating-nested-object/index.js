/**
 * @since 20180813 14:59
 * @author vivaxy
 */

const vm = new Vue({
  el: '#root',
  data: {
    items: [
      {
        key: 0,
        key1: 1,
      },
    ],
  },
  methods: {
    updateKey2() {
      console.log('updateKey2');
      this.items[0].key2 = 2;
    },
    updateItem() {
      console.log('updateItem');
      this.items = [{ key: 0, key1: 1, key2: 2 }];
    },
    updateKey2AndItem() {
      console.log('updateKey2AndItem');
      const items = this.items;
      items[0].key2 = 2;
      this.items = items;
    },
  },
});
