import { Amplify } from 'aws-amplify'



    Amplify.configure({
    Auth: {
        Cognito: {
        userPoolId: 'eu-north-1_KpbtG13rY',
        userPoolClientId: '3k2iqb28ba7lf3l2cpoe38mf7k',
        loginWith: {
            oauth: {
            domain: 'eu-north-1kpbtg13ry.auth.eu-north-1.amazoncognito.com',
            scopes: ['openid', 'email', 'phone'],
            redirectSignIn: ['http://localhost:3000/callback'],
            redirectSignOut: ['http://localhost:3000/'],
            responseType: 'code',
            },
        },
        },
    },
    })