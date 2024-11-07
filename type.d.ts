import Delta = require('quill-delta');

/**
 * @type ORG_ID
 * 空间ID
 */
export type ORG_ID = string;

/**
 * @type ACCOUNT_ID
 * 用户ID
 */
export type ACCOUNT_ID = string;

/**
 * @type NODE_ID
 * 节点ID
 */
export type NODE_ID = string;

/**
 * @interface Task
 * 定制自动化任务参数
 * @param ad {ACCOUNT_ID} 触发任务的用户ID
 * @param o {ORG_ID} 任务的空间ID
 * @param n {NODE_ID} 任务的节点ID
 */
export interface Task {
  ad: ACCOUNT_ID;
  o: ORG_ID;
  n: NODE_ID;
}

/**
 * @type TEMP_ID
 * 主题类型ID
 */
export type TEMP_ID = string;

/**
 * @type TEMP_NAME
 * 主题类型名称
 */
export type TEMP_NAME = string;

export interface TEMP_PROP {
  name: string;
}
export interface TEMP_STATUS {
  name: string;
}

export interface TEMP_INFO {
  temp_id: TEMP_ID;
  name: TEMP_NAME;
  prop: Array<TEMP_PROP>;
  task_status: Array<TEMP_STATUS>;
}

export type PROP_NAME = string;
export type STATUS_NAME = string;
export type PROP_INDEX = number;
export type STATUS_INDEX = number;
/**
 *   get node_status() {
 *     let f = this._data.f;
 *     return {
 *       index: f,
 *       is: {
 *         draft: f === NODE_STATUS.draft.index,
 *         deleted: f === NODE_STATUS.deleted.index,
 *         normal: f === NODE_STATUS.normal.index,
 *         unknown: f === NODE_STATUS.unknown.index,
 *         recycle: f === NODE_STATUS.recycle.index,
 *       },
 *       get which() {
 *         const status_key = Object.keys(NODE_STATUS).find((key) => NODE_STATUS[key].index === f);
 *         return NODE_STATUS[status_key].name;
 *       },
 *     };
 *   }
 */
export type NODE_STATUS = {
  index: number;
  is: {
    draft: boolean;
    deleted: boolean;
    normal: boolean;
    unknown: boolean;
    recycle: boolean;
  };
  which: string;
};

export type STRING_PROP = string;
export type NUMBER_PROP = number;
export type FILE_PROP = { url: Array<string>; name: Array<string> };
export type CASCADE_PROP = { id: Array<string>; tag: Array<string> };
export type SYS_PROP_NAME =
  | '_sys_ignore_children'
  | '_sys_hideChildren'
  | '_sys_protect'
  | '_sys_readonly'
  | '_sys_na_readonly'
  | '_sys_statusonly'
  | '_sys_na_statusonly';

export type PROP =
  | STRING_PROP
  | NUMBER_PROP
  | Array<STRING_PROP>
  | Array<NUMBER_PROP>
  | FILE_PROP
  | CASCADE_PROP
  | Array<LOCATION_DATA>
  | null;

export type LOCATION_DATA = {
  name: string;
  street: string;
  distCode: string;
  cityCode: string;
  provCode: string;
  add: string;
  prov: string;
  city: string;
  dist: string;
  lat: number;
  lng: number;
};

export type NODE_DATA = {
  o: ORG_ID;
  n: NODE_ID;
  t: string;
  f: number;
  e: {
    _sys_temp: [
      TEMP_ID,
      Array<Array<STRING_PROP> | Array<NUMBER_PROP> | STRING_PROP | NUMBER_PROP | null>,
    ];
    _sys_task_status: {
      index: STATUS_INDEX;
      prop: TEMP_STATUS_PROP;
    };
    _sys_attach?: { [key: PROP_INDEX]: Array<string> };
    _sys_cascade?: { [key: PROP_INDEX]: Array<string> };
    _sys_location?: { [key: PROP_INDEX]: Array<LOCATION_DATA> };
  };
  i: ACCOUNT_ID;
  h: number;
};

export type MESSAGE = string | Delta;

export type INSERT_CHILDREN = Array<{
  title: string;
  temp_id: TEMP_ID | TEMP_NAME;
  prop: Array<PROP> | { [key: PROP_NAME]: PROP };
  status_prop: TEMP_STATUS_PROP;
  status_index: STATUS_INDEX | STATUS_NAME;
  content: string | undefined;
}>;

export interface NODE {
  constructor(sdk: LJP_SDK, node_data: NODE_DATA): any;
  get org_id(): ORG_ID;
  get node_id(): NODE_ID;
  get create_time(): number;
  get creator(): ACCOUNT_ID;
  get update_time(): number;
  get modifier(): ACCOUNT_ID;
  get title(): string;
  get prop(): Array<PROP>;
  get temp_name(): TEMP_NAME;
  get temp_id(): TEMP_ID;
  getPropByName(name: PROP_NAME): PROP;
  get status_prop(): TEMP_STATUS_PROP;
  get status_name(): STATUS_NAME;
  get status_index(): STATUS_INDEX;
  get node_status(): NODE_STATUS;
  get parent(): NODE_ID;
  get first_child(): NODE_ID;
  get last_child(): NODE_ID;
  get elder_brother(): NODE_ID;
  get little_brother(): NODE_ID;
  get version(): number;
  set_title(title: string): Promise<boolean>;
  set_prop(index: Array<PROP_INDEX | PROP_NAME>, value: Array<PROP>): Promise<boolean>;
  set_status_index(index: STATUS_INDEX | STATUS_NAME, prop: TEMP_STATUS_PROP): Promise<boolean>;
  set_sys_prop(prop_name_list: Array<SYS_PROP_NAME>, value_list: Array<any>): Promise<boolean>;
  move_to(parent_id: NODE_ID, sibling_id: NODE_ID | null): Promise<boolean>;
  children(): Promise<Array<NODE>>;
  del(recycle: boolean): Promise<boolean>;
  insert_children(children: INSERT_CHILDREN, sibling_id: NODE_ID | null): Promise<Array<NODE>>;
  getPropIndexByName(name: PROP_NAME): PROP_INDEX;
  getStatusIndexByName(name: STATUS_NAME): STATUS_INDEX;
  send_message(message: MESSAGE, no_auto?: boolean): Promise<boolean>;
  get_url(): string;
  insert_doc(text: string): Promise<boolean>;
}

export type TEMP_MAP = { [key: TEMP_NAME | TEMP_ID]: TEMP_INFO };

export type TEMP_STATUS_PROP = [
  ACCOUNT_ID | null,
  Array<ACCOUNT_ID>,
  number | null,
  number | null,
  string | null,
];
export type NICKNAME = string;
export type NICKNAME_MAP = { [key: ACCOUNT_ID | NICKNAME]: NICKNAME | ACCOUNT_ID };

/**
 * @interface LJP_SDK
 * 连接派SDK
 */
export interface LJP_SDK {
  init(): Promise<boolean>;
  insertNode(children: INSERT_CHILDREN): Promise<Array<NODE>>;
  getRootNode(): Promise<NODE>;
  getNodes(node_id_list: Array<NODE_ID>): Promise<Array<NODE>>;
  getTempNode(temp_id: TEMP_ID | TEMP_NAME): Promise<Array<NODE>>;
  searchNode(
    temp_id: TEMP_ID | TEMP_NAME,
    temp_prop_map?:
      | Array<{
          index: PROP_INDEX | PROP_NAME;
          op: 'or' | 'and';
          value: Array<STRING_PROP | NUMBER_PROP>;
        }>
      | null
      | undefined,
    status?:
      | {
          status_index: Array<STATUS_INDEX | STATUS_NAME> | null | undefined;
          status_owner: Array<ACCOUNT_ID> | null | undefined;
          status_user: { op: 'or' | 'and'; ad: Array<ACCOUNT_ID> } | null | undefined;
          status_start_time: { begin: number; end: number } | null | undefined;
          status_end_time: { begin: number; end: number } | null | undefined;
        }
      | null
      | undefined,
    create_time?: { begin: number; end: number } | null | undefined,
    modify_time?: { begin: number; end: number } | null | undefined,
    create_user?: Array<ACCOUNT_ID> | null | undefined,
    modify_user?: Array<ACCOUNT_ID> | null | undefined,
    title?: Array<string> | null | undefined,
    tag?: { op: 'or' | 'and'; value: Array<string> } | null | undefined,
  ): Promise<Array<NODE>>;
  getNicknameMap(): Promise<NICKNAME_MAP>;
  getPropIndexByName(temp_id: TEMP_ID, name: PROP_NAME): PROP_INDEX;
  getStatusNameByIndex(temp_id: TEMP_ID | TEMP_NAME, index: STATUS_INDEX): STATUS_NAME;
  getStatusIndexByName(temp_id: TEMP_ID, name: STATUS_NAME): STATUS_INDEX;
  getTempNameById(temp_id: TEMP_ID): TEMP_NAME;
  getTempIdByName(name: TEMP_NAME): TEMP_ID;
  updateVersion(): Promise<boolean>;

  getChildren(node_id: NODE_ID): Promise<Array<NODE>>;

  /**
   * 文件上传暂时不能用
   * @param node_id
   * @param file_name
   * @param data
   */
  uploadFile(
    node_id: NODE_ID,
    file_name: string,
    data: Buffer | null | undefined,
  ): Promise<FILE_PROP>;

  request(req: {
    method: 'get' | 'put' | 'post';
    timeout: number;
    body: any;
    headers: { [key: string]: string };
  }): any;

  getTableInnerName(db_name: string, table_name: string): Promise<string | null>;
  dbQuery(db_name: string, query: string): Promise<Array<any> | null>;
  waitIndexSync(t: number): Promise<boolean>;
}
