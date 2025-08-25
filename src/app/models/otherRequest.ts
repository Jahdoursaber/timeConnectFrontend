export interface OtherRequest {
  id: number;
  message: string;
  message_file: File  | null;
  reply: string;
  reply_file: File  | null;
  is_replied: boolean;
  created_at: string;
  first_name: string;
  last_name: string;

}

