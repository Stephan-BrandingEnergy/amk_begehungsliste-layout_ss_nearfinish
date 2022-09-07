/**
 * represents one user that is authenticated with the backend
 */
export interface User {
  readonly uid: number;
  tx_extbase_type: string;
  pid: number;
  tstamp: number;
  username: string;
  password: string;
  usergroup: string;
  disable: number;
  starttime: number;
  endtime: number;
  name: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  address: string;
  telephone: string;
  fax: string;
  email: string;
  crdate: number;
  cruser_id: number;
  lockToDomain: string;
  deleted: number;
  description: string;
  uc?: any;
  title: string;
  zip: string;
  city: string;
  country: string;
  www: string;
  company: string;
  image: string;
  TSconfig: string;
  lastlogin: number;
  is_online: number;
  felogin_redirectPid: string;
  felogin_forgotHash: string;
  gender: number;
  date_of_birth: number;
  tx_femanager_confirmedbyuser: number;
  tx_femanager_confirmedbyadmin: number;
  tx_femanager_log: number;
  tx_femanager_changerequest?: any;
  tx_femanager_terms: number;
  tx_femanager_terms_date_of_acceptance: number;
}
