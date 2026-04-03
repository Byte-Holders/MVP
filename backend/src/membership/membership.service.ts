import { Injectable } from '@nestjs/common';
import { MembershipRepository } from './membership.repository';

@Injectable()
export class MembershipService {
    constructor(private readonly membershipRepository: MembershipRepository) {}
}