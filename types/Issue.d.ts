import { ISODateTimeString } from "./ISODateTimeString.d.ts";
import { OmbiUser } from "./User.d.ts";

export interface Issue {
  title: string;
  requestType: number;
  providerId: string;
  requestId: number;
  subject: string;
  description: string;
  issueCategoryId: number;
  issueCategory: {
    value: string;
    id: number;
  };
  status: number;
  resolvedDate?: ISODateTimeString;
  createdDate: ISODateTimeString;
  userReportedId: string;
  userReported: OmbiUser;
  comments?: IssueComment[];
  posterPath?: string;
  id: number;
}

export interface IssueComment {
  userId: string;
  comment: string;
  issuesId: number;
  date: ISODateTimeString;
  issues: string;
  user: OmbiUser;
  id: number;
}
