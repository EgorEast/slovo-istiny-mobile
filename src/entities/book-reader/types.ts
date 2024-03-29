export enum DescriptionXMLElementName {
  Author = 'author',
  BookTitle = 'book-title',
  Date = 'date',
  Description = 'description',
  DocumentInfo = 'document-info',
  FirstName = 'first-name',
  Genre = 'genre',
  Id = 'id',
  Lang = 'lang',
  LastName = 'last-name',
  MiddleName = 'middle-name',
  ProgramUsed = 'program-used',
  TitleInfo = 'title-info',
  Version = 'version',
}
export enum BodyXMLElementName {
  Body = 'body',
  Emphasis = 'emphasis',
  P = 'p',
  Section = 'section',
  Strong = 'strong',
  Subtitle = 'subtitle',
  Title = 'title',
}

export type XMLElementName = BodyXMLElementName | DescriptionXMLElementName;

export enum XMLElementType {
  Element = 'element',
  Text = 'text',
}

export type XMLElementElement =
  | {
      elements: XMLElementElement[];
      name:
        | BodyXMLElementName.Body
        | BodyXMLElementName.P
        | BodyXMLElementName.Section
        | BodyXMLElementName.Subtitle
        | BodyXMLElementName.Title
        | DescriptionXMLElementName;
      text?: undefined;
      type: XMLElementType.Element;
    }
  | {
      elements: XMLElementText[];
      name: BodyXMLElementName.Emphasis | BodyXMLElementName.Strong;
      text?: undefined;
      type: XMLElementType.Element;
    };

export interface XMLElementText {
  elements?: undefined;
  name?: undefined;
  text: boolean | number | string;
  type: XMLElementType.Text;
}

export type XMLElement = XMLElementElement | XMLElementText;
