import getRem from './rem';
import React from 'react';

test('Rem', async () => {

  getRem().applyPlugins({
    constants: {
      DEFAULT_VALUE: '-11111111111111',
    },
  });

  console.log(getRem().constants.DEFAULT_VALUE);

});
