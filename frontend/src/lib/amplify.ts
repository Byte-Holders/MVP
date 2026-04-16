import { Amplify } from 'aws-amplify'

export const cognitoConfig = {
  domain: 'eu-north-1kpbtg13ry.auth.eu-north-1.amazoncognito.com',
  clientId: '3k2iqb28ba7lf3l2cpoe38mf7k',
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_KpbtG13rY',
      userPoolClientId: cognitoConfig.clientId,
      loginWith: {
        oauth: {
          domain: cognitoConfig.domain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [
            'https://develop.dfk7n70x1c1hn.amplifyapp.com/callback',
            'http://localhost:3000/callback',
          ],
          redirectSignOut: [
            'https://develop.dfk7n70x1c1hn.amplifyapp.com/',
            'http://localhost:3000/',
          ],
          responseType: 'code',
        },
      },
    },
  },
})
