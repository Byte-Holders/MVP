import { Global, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [
        PassportModule.register({defaultStrategy: "jwt"}),
        UserModule
    ],
    providers: [
        JwtStrategy
    ]
})
export class AuthModule {}
