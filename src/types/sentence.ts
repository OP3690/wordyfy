export interface Sentence {
  _id?: string;
  userId: string;
  text: string;
  type: 'quote' | 'sentence' | 'text' | 'note';
  author?: string;
  source?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSentenceRequest {
  text: string;
  type: 'quote' | 'sentence' | 'text' | 'note';
  author?: string;
  source?: string;
  tags?: string[];
}
