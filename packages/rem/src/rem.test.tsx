import rem from './rem';
import React from 'react';

test('Rem', async () => {

  rem.applyPlugins({
    constants: {
      DEFAULT_VALUE: '-11111111111111',
    },
  });

  console.log(rem.constants.DEFAULT_VALUE);

});
