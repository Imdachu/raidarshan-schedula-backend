import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { role } = req.query;
    
    // Pass the role from the initial request's query into the 'state' parameter
    // This ensures it's available in the callback
    return { state: role };
  }
}