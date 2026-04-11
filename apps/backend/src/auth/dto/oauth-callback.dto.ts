import { IsString } from 'class-validator';

export class OAuthCallbackDto {
  @IsString()
  supabaseToken: string;
}
