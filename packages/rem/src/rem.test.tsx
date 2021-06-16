import createRem, {constants} from './rem';

test('Rem', async () => {
  createRem({
    constants: {
      defaultValue: 'xxxx'
    }
  })
  console.log(constants)
});
