export namespace ApiResponseModul {
  export interface Root {
    rundgaenge: Rundgang[]
    user: User[]
    schwerpunkte: Schwerpunkt[]
    bereiche: Bereich[]
    massnahmen: Massnahme[]
  }

  export interface Rundgang {
    data: Data
    schwerpunkt: Schwerpunkt
    maengel: Mangel[]
    teilnehmer: User[]
    verantwortlicher: User
    uid?: number
    kurztext: string
    ort: string
  }

  export interface Data {
    kurztext: string
    ort: string
    pid?: number
    uid?: number
  }

  export interface Mangel {
    uid?: number
    text: string
    massnahme?: Massnahme
    bereich?: Bereich
    verantwortlicher?: User
    tstamp?: any
    status?: number
    termin?: any
    images?: any[]
    logs?: LogEintrag[]
  }

  export interface LogEintrag {
    uid?: number
    text: string
    crdate?: any
    type: string
    user?: User
  }

  export interface User {
    address?: string
    city?: string
    company?: string
    country?: string
    email?: string
    fax?: string
    firstName: string
    lastName: string
    lockToDomain?: string
    middleName?: string
    name?: string
    password?: string
    pid?: number
    telephone?: string
    title?: string
    uid?: number
    username?: string
    www?: string
    zip?: string
    lastlogin?: any
  }

  export interface Schwerpunkt {
    name?: string
    pid?: number
    uid?: number
  }
  export interface Bereich {
    name?: string
    pid?: number
    uid?: number
  }

  export interface Massnahme {
    name?: string
    pid?: number
    uid?: number
  }
}
