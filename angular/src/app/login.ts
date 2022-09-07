import {User} from './user';

/**
 * represents a Login: an authenticated User and the corresponding session-token
 */
export interface Login {
  readonly token: string;
  readonly user: User;
}
