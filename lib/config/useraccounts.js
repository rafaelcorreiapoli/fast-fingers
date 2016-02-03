AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
    _id: 'nickname',
    type: 'text',
    required: true,
  },
  {
    _id: 'username',
    type: 'text',
    displayName: 'Usuário',
    required: true,
  },
  {
    _id: 'username_and_email',
    type: 'text',
    required: true,
    displayName: 'Username ou Email',
    placeholder: 'Username ou Email'
  },
  {
    _id: 'password',
    type: 'password',
    required: true,
    minLength: 6,
    displayName: 'Senha',
    errStr: 'Mínimo de 6 caracteres',
  },
]);
