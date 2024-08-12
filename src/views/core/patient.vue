<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { PureTable } from "@pureadmin/table";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import { CollapseModelValue } from "element-plus";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import PatientEdit from "./modules/patient-edit.vue";
import { hasAuth } from "@/router/utils";
import { enableConvert, enabledBooleanConvert } from "@/constants/convert";
import { enableOptions } from "@/constants/constants";
import * as patientApi from "@/api/core/patient";
import * as generalApi from "@/api/core/general";
import * as caseApi from "@/api/core/case";
import "plus-pro-components/es/components/form/style/css";
import { ElMessage } from "element-plus";

defineOptions({ name: "corePatient" });

// 引用和状态
const patientEditRef = ref();
// const currentRowId = ref(null);
const rowActiveNames = ref<{ [key: number]: CollapseModelValue }>({});
const rowDataLoading = ref<{
  [key: number]: { general: boolean; case: boolean };
}>({});
const expandedFormData = reactive<{ [key: number]: any }>({});

// 页面数据
const pageData: any = reactive({
  permission: {
    query: [],
    add: ["patient:save"],
    update: ["patient:update"],
    delete: ["patient:del"],
    general_update: ["general:update"]
  },
  searchState: true,
  searchField: [
    {
      type: "input",
      label: "角色编码",
      prop: "roleCode",
      placeholder: "精准查询角色编码"
    },
    {
      type: "input",
      label: "角色名称",
      prop: "roleName",
      placeholder: "模糊查询角色名称"
    },
    {
      type: "select",
      label: "状态",
      prop: "enabled",
      placeholder: "请选择",
      dataSourceKey: "enabledOptions",
      options: {
        keys: {
          label: "label",
          value: "value",
          prop: "value"
        },
        filterable: true
      }
    }
  ],
  dataSource: {
    enabledOptions: enableOptions
  },
  searchForm: {},
  btnOpts: {
    left: [
      {
        key: "add",
        label: "新增",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["patient:save"]
      }
    ],
    right: [
      {
        key: "search",
        label: "查询",
        icon: "ep:search",
        state: true,
        options: {
          circle: true
        }
      },
      {
        key: "refresh",
        label: "刷新",
        icon: "ep:refresh",
        state: true,
        options: {
          circle: true
        }
      }
    ]
  },
  tableParams: {
    columns: [
      // ... 表格列配置（保持不变）
    ],
    list: [],
    loading: false,
    pagination: {
      pageSize: 10,
      currentPage: 1,
      total: 0
    }
  }
});

// 表格列定义
const tableColumns: TableColumnList = [
  {
    type: "expand",
    slot: "expand"
  },
  {
    label: "姓名",
    prop: "name"
  },
  {
    label: "性别",
    prop: "sex",
    formatter: row => (row.sex === 0 ? "女" : "男")
  },
  {
    label: "年龄",
    prop: "age"
  },
  {
    label: "电话",
    prop: "phone"
  },
  {
    label: "联系人电话",
    prop: "contactPhone"
  },
  {
    label: "录入状态",
    prop: "inputStatus",
    formatter: row => {
      const statusMap = {
        0: "未开始",
        1: "进行中",
        2: "已完成"
      };
      return statusMap[row.inputStatus] || "未知";
    }
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "张三",
    sex: "男",
    age: 35,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "北京市朝阳区",
    inputStatus: "已完成",
    general: {},
    case: {}
  },
  {
    id: 2,
    name: "李四",
    sex: "女",
    age: 28,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "上海市浦东新区",
    inputStatus: "进行中",
    general: {},
    case: {}
  },
  {
    id: 3,
    name: "王五",
    sex: "男",
    age: 42,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "广州市天河区",
    inputStatus: "已完成"
  },
  {
    id: 4,
    name: "赵六",
    sex: "女",
    age: 31,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "深圳市南山区",
    inputStatus: "未开始"
  },
  {
    id: 5,
    name: "孙七",
    sex: "男",
    age: 50,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "成都市武侯区",
    inputStatus: "已完成"
  },
  {
    id: 6,
    name: "周八",
    sex: "女",
    age: 25,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "武汉市江汉区",
    inputStatus: "进行中"
  },
  {
    id: 7,
    name: "吴九",
    sex: "男",
    age: 38,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "西安市雁塔区",
    inputStatus: "已完成"
  },
  {
    id: 8,
    name: "郑十",
    sex: "女",
    age: 45,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "杭州市西湖区",
    inputStatus: "未开始"
  },
  {
    id: 9,
    name: "刘十一",
    sex: "男",
    age: 33,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "南京市玄武区",
    inputStatus: "进行中"
  },
  {
    id: 10,
    name: "陈十二",
    sex: "女",
    age: 29,
    phone: "18888888888",
    contactPhone: "18555555555",
    address: "重庆市渝中区",
    inputStatus: "已完成"
  }
];

// 一般资料模拟数据
// const mockGeneralData = [
//   {
//     id: 1,
//     surgicalNum: "A2024050501",
//     caseNo: "4110222555003"
//   },
//   {
//     id: 3,
//     surgicalNum: "A2024050501",
//     caseNo: "4110222555003"
//   }
// ];

// 病历资料模拟数据
// const mockCaseData = [
//   {
//     id: 3,
//     admissionUltrasound: "未做",
//     uSize: "",
//     uBloodSignal: null
//   },
//   {
//     id: 1,
//     admissionUltrasound: "左",
//     uSize: "10",
//     uBloodSignal: "true"
//   }
// ];

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入名称" }]
};

// 主表单列定义
const mainFormColumns: PlusColumn[] = [
  {
    label: "患者姓名",
    width: 120,
    prop: "name",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入患者姓名"
    }
  },
  {
    label: "性别",
    width: 120,
    prop: "sex",
    valueType: "select",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请选择性别"
    },
    options: [
      {
        label: "男",
        value: 1,
        color: "red"
      },
      {
        label: "女",
        value: 0,
        color: "blue"
      }
    ]
  },
  {
    label: "年龄",
    prop: "age",
    valueType: "input-number",
    colProps: { span: 12 },
    fieldProps: { step: 1 }
  },
  {
    label: "电话",
    width: 120,
    prop: "phone",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入电话" // 直接设置placeholder
    }
  },
  {
    label: "联系人电话",
    width: 120,
    prop: "contactPhone",
    valueType: "copy",
    fieldProps: {
      placeholder: "请输入联系人电话" // 直接设置placeholder
    }
  },
  {
    label: "住址",
    prop: "address",
    valueType: "textarea",
    fieldProps: {
      placeholder: "请输入住址",
      maxlength: 100,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  {
    label: "身高",
    width: 120,
    prop: "height",
    valueType: "input-number",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入身高" // 直接设置placeholder
    }
  },
  {
    label: "体重",
    width: 120,
    prop: "weight",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入体重" // 直接设置placeholder
    }
  },
  {
    label: "BMI指数",
    prop: "bmi",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 1 }
  }
];

// 一般资料表单列定义
const generalFormColumns: PlusColumn[] = [
  {
    label: "手术编号",
    width: 120,
    prop: "surgicalNum",
    valueType: "copy",
    tooltip: "A + 手术日期 + 数字",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入手术编号" // 直接设置placeholder
    }
  },
  {
    label: "病案号",
    width: 120,
    prop: "caseNo",
    valueType: "copy",
    colProps: { span: 12 },
    fieldProps: {
      placeholder: "请输入病案号"
    }
  }
];

// 生成病历资料表单列
// const generateCaseColumns = (rowId: number): PlusColumn[] => {
//   const row = expandedFormData[rowId];
//   const isDisabled =
//     !row ||
//     !row.case?.admissionUltrasound ||
//     row.case.admissionUltrasound === "未做";

//   return [
//     {
//       label: "入院超声",
//       width: 120,
//       prop: "admissionUltrasound",
//       valueType: "select",
//       colProps: { span: 12 },
//       fieldProps: {
//         placeholder: "请选择状态"
//       },
//       options: [
//         { label: "未做", value: "未做", color: "red" },
//         { label: "左", value: "左", color: "blue" },
//         { label: "右", value: "右", color: "yellow" },
//         { label: "双侧", value: "双侧", color: "green" }
//       ]
//     },
//     {
//       label: "大小/cm",
//       width: 120,
//       prop: "uSize",
//       valueType: "copy",
//       colProps: { span: 12 },
//       fieldProps: {
//         placeholder: "请输入大小",
//         disabled: isDisabled
//       }
//     },
//     {
//       label: "血流信号",
//       width: 120,
//       prop: "uBloodSignal",
//       valueType: "select",
//       colProps: { span: 12 },
//       fieldProps: {
//         placeholder: "请选择",
//         disabled: isDisabled
//       },
//       options: [
//         { label: "有", value: "true", color: "red" },
//         { label: "无", value: "false", color: "blue" }
//       ]
//     },
//     {
//       label: "BIRADS",
//       width: 120,
//       prop: "uBirads",
//       valueType: "copy",
//       colProps: { span: 12 },
//       fieldProps: {
//         placeholder: "请输入类别",
//         disabled: isDisabled
//       }
//     }
//   ] as PlusColumn[];
// };
const generateCaseColumns = (rowId: number): PlusColumn[] => {
  const row = expandedFormData[rowId];

  const isUltrasoundDisabled =
    !row || !row.case?.ultrasoundStatus || row.case.ultrasoundStatus === 0;

  const isMammographyDisabled =
    !row || !row.case?.mammographyStatus || row.case.mammographyStatus === 0;

  const isMriDisabled =
    !row || !row.case?.mriStatus || row.case.mriStatus === 0;

  const isBreastCoreNeedleDisabled =
    !row || !row.case?.breastCoreNeedle || row.case.breastCoreNeedle === 0;

  const isAxillaryCoreNeedleDisabled =
    !row || !row.case?.axillaryCoreNeedle || row.case.axillaryCoreNeedle === 0;

  const isAxillaryFineNeedleDisabled =
    !row || !row.case?.axillaryFineNeedle || row.case.axillaryFineNeedle === 0;

  const isIhcDisabled =
    !row || !row.case?.ihcResult || row.case.ihcResult === 0;

  return [
    // 入院超声检查
    {
      label: "入院超声状态",
      width: 120,
      prop: "ultrasoundStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "超声大小/cm",
      width: 120,
      prop: "ultrasoundSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isUltrasoundDisabled
      }
    },
    {
      label: "血流信号",
      width: 120,
      prop: "ultrasoundBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isUltrasoundDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "ultrasoundBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isUltrasoundDisabled
      }
    },

    // 入院钼靶检查
    {
      label: "入院钼靶状态",
      width: 120,
      prop: "mammographyStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "钼靶大小/cm",
      width: 120,
      prop: "mammographySize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isMammographyDisabled
      }
    },
    {
      label: "细小钙化影",
      width: 120,
      prop: "mammographyAggregation",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMammographyDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "mammographyBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isMammographyDisabled
      }
    },

    // 入院乳腺核磁检查
    {
      label: "入院乳腺核磁状态",
      width: 120,
      prop: "mriStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择状态"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "左", value: 1, color: "blue" },
        { label: "右", value: 2, color: "yellow" },
        { label: "双侧", value: 3, color: "green" }
      ]
    },
    {
      label: "乳腺大小/cm",
      width: 120,
      prop: "mriSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isMriDisabled
      }
    },
    {
      label: "增强信号",
      width: 120,
      prop: "mriBloodFlow",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择",
        disabled: isMriDisabled
      },
      options: [
        { label: "有", value: 1, color: "red" },
        { label: "无", value: 0, color: "blue" }
      ]
    },
    {
      label: "BIRADS",
      width: 120,
      prop: "mriBirads",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入类别",
        disabled: isMriDisabled
      }
    },

    // 血常规检查
    {
      label: "白细胞计数",
      width: 120,
      prop: "wbc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入白细胞计数"
      }
    },
    {
      label: "红细胞计数",
      width: 120,
      prop: "rbc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入红细胞计数"
      }
    },
    {
      label: "血小板计数",
      width: 120,
      prop: "platelets",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血小板计数"
      }
    },

    // 肝功能检查
    {
      label: "谷丙转氨酶",
      width: 120,
      prop: "alt",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷丙转氨酶"
      }
    },
    {
      label: "谷草转氨酶",
      width: 120,
      prop: "ast",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入谷草转氨酶"
      }
    },
    {
      label: "碱性磷酸酶",
      width: 120,
      prop: "alkalinePhosphatase",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入碱性磷酸酶"
      }
    },

    // 肾功能检查
    {
      label: "血肌酐",
      width: 120,
      prop: "creatinine",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血肌酐"
      }
    },
    {
      label: "血清尿素",
      width: 120,
      prop: "urea",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入血清尿素"
      }
    },
    {
      label: "尿酸",
      width: 120,
      prop: "uricAcid",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入尿酸"
      }
    },

    // 入院乳腺核心针检查
    {
      label: "入院乳腺核心针",
      width: 120,
      prop: "breastCoreNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "做了", value: 1, color: "green" }
      ]
    },
    {
      label: "乳腺核心针大小/cm",
      width: 120,
      prop: "breastCoreNeedleSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isBreastCoreNeedleDisabled
      }
    },
    {
      label: "乳腺核心针组织学",
      width: 120,
      prop: "breastCoreNeedleHistology",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入组织学结果",
        disabled: isBreastCoreNeedleDisabled
      }
    },
    {
      label: "乳腺核心针IHC",
      width: 120,
      prop: "breastCoreNeedleIhc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入IHC结果",
        disabled: isBreastCoreNeedleDisabled
      }
    },

    // 入院腋窝核心针检查
    {
      label: "入院腋窝核心针",
      width: 120,
      prop: "axillaryCoreNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "做了", value: 1, color: "green" }
      ]
    },
    {
      label: "腋窝核心针大小/cm",
      width: 120,
      prop: "axillaryCoreNeedleSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isAxillaryCoreNeedleDisabled
      }
    },
    {
      label: "腋窝核心针组织学",
      width: 120,
      prop: "axillaryCoreNeedleHistology",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入组织学结果",
        disabled: isAxillaryCoreNeedleDisabled
      }
    },
    {
      label: "腋窝核心针IHC",
      width: 120,
      prop: "axillaryCoreNeedleIhc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入IHC结果",
        disabled: isAxillaryCoreNeedleDisabled
      }
    },

    // 入院腋窝细针穿刺检查
    {
      label: "入院腋窝细针穿刺",
      width: 120,
      prop: "axillaryFineNeedle",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "做了", value: 1, color: "green" }
      ]
    },
    {
      label: "腋窝细针穿刺大小/cm",
      width: 120,
      prop: "axillaryFineNeedleSize",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入大小",
        disabled: isAxillaryFineNeedleDisabled
      }
    },
    {
      label: "腋窝细针穿刺组织学",
      width: 120,
      prop: "axillaryFineNeedleHistology",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入组织学结果",
        disabled: isAxillaryFineNeedleDisabled
      }
    },
    {
      label: "腋窝细针穿刺IHC",
      width: 120,
      prop: "axillaryFineNeedleIhc",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入IHC结果",
        disabled: isAxillaryFineNeedleDisabled
      }
    },

    // 入院IHC检查
    {
      label: "入院IHC检查",
      width: 120,
      prop: "ihcResult",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择是否进行"
      },
      options: [
        { label: "未做", value: 0, color: "red" },
        { label: "做了", value: 1, color: "green" }
      ]
    },
    {
      label: "IHC ER状态",
      width: 120,
      prop: "ihcErStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择ER状态",
        disabled: isIhcDisabled
      },
      options: [
        { label: "阴性", value: 0, color: "red" },
        { label: "阳性", value: 1, color: "green" }
      ]
    },
    {
      label: "IHC PR状态",
      width: 120,
      prop: "ihcPrStatus",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择PR状态",
        disabled: isIhcDisabled
      },
      options: [
        { label: "阴性", value: 0, color: "red" },
        { label: "阳性", value: 1, color: "green" }
      ]
    },
    {
      label: "IHC HER2状态",
      width: 120,
      prop: "ihcHer2Status",
      valueType: "select",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请选择HER2状态",
        disabled: isIhcDisabled
      },
      options: [
        { label: "阴性", value: 0, color: "red" },
        { label: "阳性", value: 1, color: "green" }
      ]
    },
    {
      label: "IHC KI67状态",
      width: 120,
      prop: "ihcKi67Status",
      valueType: "copy",
      colProps: { span: 12 },
      fieldProps: {
        placeholder: "请输入KI67状态",
        disabled: isIhcDisabled
      }
    }
  ] as PlusColumn[];
};

// 功能函数
const updateSearchForm = (data: any) => {
  pageData.searchForm = data;
};

const handleSearch = () => {
  loadTableData();
};

const resetSearch = (data?: any) => {
  pageData.searchForm = data || {};
};

const toggleSearchState = () => {
  pageData.searchState = !pageData.searchState;
};

const handlePageChange = (current: number, size: number) => {
  pageData.tableParams.pagination.currentPage = current;
  pageData.tableParams.pagination.pageSize = size;
  loadTableData();
};

const loadTableData = () => {
  pageData.tableParams.loading = true;
  const query = {
    ...pageData.searchForm,
    current: pageData.tableParams.pagination.currentPage,
    size: pageData.tableParams.pagination.pageSize
  };

  patientApi
    .patientQueryPage(query)
    .then((res: any) => {
      if (res.success) {
        pageData.tableParams.list = res.result.records;
        pageData.tableParams.pagination.total = Number(res.result.total);
      }
    })
    .finally(() => {
      pageData.tableParams.loading = false;
    });
};

const handleBtnClick = (action: string) => {
  switch (action) {
    case "add":
      patientEditRef.value?.open();
      break;
    case "search":
      toggleSearchState();
      break;
    case "refresh":
      loadTableData();
      break;
  }
};

const handleEdit = (row: any, type: "general" | "case" | "main") => {
  if (hasAuth(pageData.permission.update) && row.isSystem !== 1) {
    editState[type][String(row.id)] = !editState[type][String(row.id)];
    // 更新表单项的禁用状态
    expandedFormData[row.id][type] = {
      ...expandedFormData[row.id][type],
      disabled: !editState[type][String(row.id)]
    };
  } else {
    ElMessage.error("您没有编辑权限");
  }
};

const handleFormChange = (
  values: FieldValues,
  column: PlusColumn,
  rowId: number
) => {
  console.log(values, column, "change");
  if (column.prop === "admissionUltrasound") {
    const caseData = expandedFormData[rowId].case;
    if (
      !caseData.admissionUltrasound ||
      caseData.admissionUltrasound === "未做"
    ) {
      caseData.uSize = "";
      caseData.uBloodSignal = "";
      caseData.uBirads = "";
    }
    expandedFormData[rowId] = { ...expandedFormData[rowId] };
  }
};

// const handleSubmit = (values: FieldValues) => {
//   console.log(values, "Submit");
// };

// const handleSubmitError = (err: any) => {
//   console.log(err, "err");
// };

// 处理表单重置
// const handleReset = (rowId: number) => {
//   console.log("handleReset for row:", rowId);
//   // 重置当前行的数据，但保留 id
//   const id = expandedFormData[rowId].id;
//   expandedFormData[rowId] = { id, general: {}, case: {} };
//   // 重新加载一般资料和病历资料
//   loadGeneralData(rowId);
//   loadCaseData(rowId);
// };

// 处理重置
// const handleReset = (rowId: number, type: "general" | "case"): void => {
//   if (!editState[type][rowId]) {
//     ElMessage.warning("当前不处于编辑状态，无法重置");
//     return;
//   }
//   // 执行重置逻辑
//   console.log("handleReset for row:", rowId);
//   // 重置当前行的数据，但保留 id
//   const id = expandedFormData[rowId].id;
//   expandedFormData[rowId] = { id, general: {}, case: {} };
//   // 重新加载一般资料和病历资料
//   loadGeneralData(rowId);
//   loadCaseData(rowId);
// };

// 处理折叠面板变化
const handleCollapseChange = (val: CollapseModelValue, rowId: number) => {
  rowActiveNames.value[rowId] = val;
  if (Array.isArray(val)) {
    if (val.includes("1") && !expandedFormData[rowId].general.surgicalNum) {
      loadGeneralData(rowId);
    }
    if (
      val.includes("2") &&
      !expandedFormData[rowId].case.admissionUltrasound
    ) {
      loadCaseData(rowId);
    }
  }
};

// 加载一般资料
const loadGeneralData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, case: false };
  }
  rowDataLoading.value[id].general = true;

  const query = { patientId: id };

  generalApi
    .generalQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const generalData = res.result[0]; // 假设我们只需要第一条记录

        // 创建一个新的对象来存储一般资料，而不是直接修改 expandedFormData
        const newGeneralData = {
          surgicalNum: generalData.surgicalNum,
          caseNo: generalData.caseNo
          // 可以根据需要添加其他字段
        };

        // 更新 expandedFormData，但保持原始数据不变
        expandedFormData[id] = {
          ...expandedFormData[id],
          general: { ...newGeneralData },
          originalGeneral: { ...newGeneralData } // 保存原始数据
        };
      } else {
        // 如果没有数据，设置为空对象
        expandedFormData[id] = {
          ...expandedFormData[id],
          general: {},
          originalGeneral: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load general data:", error);
      // 出错时也设置为空对象
      expandedFormData[id] = {
        ...expandedFormData[id],
        general: {},
        originalGeneral: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].general = false;
    });
};

// 加载病历资料
const loadCaseData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = { general: false, case: false };
  }
  rowDataLoading.value[id].case = true;

  const query = { patientId: id };

  caseApi
    .caseQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const caseData = res.result[0]; // 假设我们只需要第一条记录

        // 创建一个新的对象来存储一般资料，而不是直接修改 expandedFormData
        const newCaseData = {
          // 基础信息
          id: caseData.id,
          patientId: caseData.patientId,

          // 入院超声检查
          ultrasoundStatus: caseData.ultrasoundStatus,
          ultrasoundSize: caseData.ultrasoundSize,
          ultrasoundBloodFlow: caseData.ultrasoundBloodFlow,
          ultrasoundBirads: caseData.ultrasoundBirads,

          // 入院钼靶检查
          mammographyStatus: caseData.mammographyStatus,
          mammographySize: caseData.mammographySize,
          mammographyAggregation: caseData.mammographyAggregation,
          mammographyBirads: caseData.mammographyBirads,

          // 入院乳腺核磁检查
          mriStatus: caseData.mriStatus,
          mriSize: caseData.mriSize,
          mriBloodFlow: caseData.mriBloodFlow,
          mriBirads: caseData.mriBirads,

          // 血常规检查
          wbc: caseData.wbc,
          rbc: caseData.rbc,
          platelets: caseData.platelets,

          // 肝功能检查
          alt: caseData.alt,
          ast: caseData.ast,
          alkalinePhosphatase: caseData.alkalinePhosphatase,

          // 肾功能检查
          creatinine: caseData.creatinine,
          bun: caseData.bun,
          uricAcid: caseData.uricAcid,

          // 血脂检查
          triglycerides: caseData.triglycerides,
          ldl: caseData.ldl,

          // D-二聚体检查
          dimer: caseData.dimer,

          // 肿瘤标志物检查
          cea: caseData.cea,
          ca153: caseData.ca153,
          ca125: caseData.ca125,

          // 乳腺粗针穿刺病理结果
          breastCoreNeedle: caseData.breastCoreNeedle,
          breastCoreNeedleResult: caseData.breastCoreNeedleResult,

          // 腋窝粗针穿刺病理结果
          axillaryCoreNeedle: caseData.axillaryCoreNeedle,
          axillaryCoreNeedleResult: caseData.axillaryCoreNeedleResult,

          // 腋窝细针穿刺病理结果
          axillaryFineNeedle: caseData.axillaryFineNeedle,
          axillaryFineNeedleResult: caseData.axillaryFineNeedleResult,

          // 免疫组化结果
          ihcResult: caseData.ihcResult,
          erPct: caseData.erPct,
          prPct: caseData.prPct,
          her2: caseData.her2,
          ki67Pct: caseData.ki67Pct,
          arPct: caseData.arPct,
          fishTest: caseData.fishTest,

          // TNM分期
          tnm: caseData.tnm,
          stage: caseData.stage,

          // 亚型分型
          subtype: caseData.subtype,

          // 入录信息
          inputStatus: caseData.inputStatus,
          createdBy: caseData.createdBy,
          created: caseData.created,
          modifiedBy: caseData.modifiedBy,
          modified: caseData.modified,
          isEnable: caseData.isEnable,
          isDel: caseData.isDel
        };

        // 更新 expandedFormData，但保持原始数据不变
        expandedFormData[id] = {
          ...expandedFormData[id],
          case: { ...newCaseData },
          originalCase: { ...newCaseData } // 保存原始数据
        };
      } else {
        // 如果没有数据，设置为空对象
        expandedFormData[id] = {
          ...expandedFormData[id],
          case: {},
          originalCase: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load case data:", error);
      // 出错时也设置为空对象
      expandedFormData[id] = {
        ...expandedFormData[id],
        case: {},
        originalGeneral: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].case = false;
    });
};

// 处理展开/折叠
const handleExpand = (row: any, expanded: boolean) => {
  if (expanded) {
    if (!expandedFormData[row.id]) {
      expandedFormData[row.id] = {
        main: { ...row, disabled: true },
        general: {},
        case: {}
      };
    }
    if (!rowActiveNames.value[row.id]) {
      rowActiveNames.value[row.id] = [];
    }
    if (!rowDataLoading.value[row.id]) {
      rowDataLoading.value[row.id] = { general: false, case: false };
    }
    // 当展开行时，立即加载数据
    loadGeneralData(row.id);
    loadCaseData(row.id);
  }
};

// 编辑状态
const editState: { [key: string]: { [key: string]: boolean } } = reactive({
  general: {},
  case: {},
  main: {}
});

// 权限检查函数（示例）
const checkEditPermission = (type: string): boolean => {
  // 检查当前用户是否有 general_update 权限
  if (type === "general") {
    return hasAuth(pageData.permission.general_update);
  } else {
    // 其他类型的权限检查逻辑
    return true; // 假设用户有权限
  }
};

// 处理编辑按钮点击
const handleGeneralEdit = (rowId: number, type: "general" | "case"): void => {
  if (checkEditPermission(type)) {
    editState[type][rowId] = !editState[type][rowId];
  } else {
    // 显示无权限提示
    ElMessage.error("您没有编辑权限");
  }
};

// 模拟API调用
const someApiCall = async (values: FieldValues) => {
  // 这里应该是实际的API调用
  console.log("API call with values:", values);
  return new Promise(resolve => setTimeout(resolve, 1000));
};

// 处理提交
// const handleSubmit = async (values: FieldValues): Promise<void> => {
//   try {
//     // 获取当前编辑的行ID和类型
//     const rowId =
//       Object.keys(editState.general).find(
//         id => editState.general[Number(id)]
//       ) ||
//       Object.keys(editState.case).find(id => editState.case[Number(id)]);
//     const type = editState.general[Number(rowId)] ? "general" : "case";

//     if (!rowId || !type) {
//       throw new Error("无法确定当前编辑的行或类型");
//     }

//     if (!editState[type][Number(rowId)]) {
//       ElMessage.warning("当前不处于编辑状态，无法提交");
//       return;
//     }

//     console.log(values, "Submit");
//     // 尝试提交
//     await someApiCall(values);
//     // 提交成功后，退出编辑状态
//     editState[type][Number(rowId)] = false;
//     ElMessage.success("提交成功");
//   } catch (error) {
//     console.error("提交失败", error);
//     ElMessage.error("提交失败，请重试");
//   }
// };

// 主表单处理函数
const handleMainFormSubmit = (values: FieldValues): Promise<void> => {
  // try {
  //   console.log("主表单提交:", values);
  //   await someApiCall(values);
  //   ElMessage.success("主表单提交成功");
  // } catch (error) {
  //   console.error("主表单提交失败", error);
  //   ElMessage.error("主表单提交失败，请重试");
  // }
  // pageData.formParam.loading = true;
  // patientApi
  //   .patientUpdate(values.id, values)
  //   .then(res => {
  //     if (res.success) {
  //       ElMessage.success("主表单提交成功");
  //     } else {
  //       console.error("主表单提交失败", res.message);
  //       ElMessage.error("主表单提交失败，请重试");
  //     }
  //   })
  //   .finally(() => {
  //     pageData.formParam.loading = false;
  //   });
  // pageData.tableParams.loading = true;

  // // 将 id 转换为字符串
  // const id = String(values.id);
  // console.log(id);
  // // 创建一个新的对象，排除 id 字段
  // const { id: _, ...updateData } = values;

  // patientApi
  //   .patientUpdate(id, updateData)
  //   .then(res => {
  //     if (res.success) {
  //       ElMessage.success("主表单提交成功");
  //       // 更新本地数据
  //       expandedFormData[id].main = { ...values };
  //       // 可能需要重新加载表格数据
  //       loadTableData();
  //     } else {
  //       throw new Error(res.message || "未知错误");
  //     }
  //   })
  //   .catch(error => {
  //     console.error("主表单提交失败", error);
  //     ElMessage.error(`主表单提交失败：${error.message || "请重试"}`);
  //   })
  //   .finally(() => {
  //     pageData.tableParams.loading = false;
  //   });

  try {
    pageData.tableParams.loading = true;
    // 获取当前行的编辑状态
    const rowId = String(values.id);
    if (!editState.main[rowId]) {
      ElMessage.warning("当前行不处于编辑状态,无法提交");
      return;
    }

    console.log("主表单提交:", values);

    const { id: _, ...updateData } = values;

    patientApi
      .patientUpdate(rowId, updateData)
      .then(res => {
        if (res.success) {
          ElMessage.success("主表单提交成功");
          // 更新本地数据
          expandedFormData[rowId].main = { ...values };
          // 可能需要重新加载表格数据
          // loadTableData();
        } else {
          throw new Error(res.message || "未知错误");
        }
      })
      .catch(error => {
        console.error("主表单提交失败", error);
        ElMessage.error(`主表单提交失败：${error.message || "请重试"}`);
      })
      .finally(() => {
        // 退出编辑状态
        editState.main[rowId] = false;
        // 恢复表单项的禁用状态
        expandedFormData[rowId].main.disabled = true;
        pageData.tableParams.loading = false;
      });
    // await someApiCall(values);
    // ElMessage.success("主表单提交成功");

    // 更新本地数据
    // expandedFormData[rowId].main = { ...values };
  } catch (error) {
    console.error("主表单提交失败", error);
    ElMessage.error("主表单提交失败,请重试");
  }
};

// 修改主表单重置函数
const handleMainFormReset = (rowId: string): void => {
  // 重置主表单相关的字段
  const originalData = mockData.find(item => item.id === Number(rowId)) || {};
  const mainFormFields = [
    "name",
    "sex",
    "age",
    "phone",
    "contactPhone",
    "address",
    "height",
    "weight",
    "bmi"
  ];

  const resetData = {
    id: Number(rowId),
    ...Object.fromEntries(
      mainFormFields.map(field => [field, originalData[field] || ""])
    ),
    general: expandedFormData[rowId].general,
    case: expandedFormData[rowId].case,
    disabled: true // 设置表单项为禁用状态
  };

  expandedFormData[rowId] = resetData;
  // 退出编辑状态
  editState.main[rowId] = false;
};

// 一般资料表单处理函数
const handleGeneralFormSubmit = async (
  values: FieldValues,
  rowId: number
): Promise<void> => {
  try {
    console.log("一般资料表单提交:", values);
    await someApiCall(values);
    editState.general[rowId] = false;
    ElMessage.success("一般资料提交成功");
  } catch (error) {
    console.error("一般资料提交失败", error);
    ElMessage.error("一般资料提交失败，请重试");
  }
};

// 修改一般资料表单重置函数
const handleGeneralFormReset = (rowId: number): void => {
  if (!editState.general[rowId]) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置一般资料表单，行ID:", rowId);
  // 直接重置一般资料相关的字段
  expandedFormData[rowId].general = {
    surgicalNum: "",
    caseNo: ""
  };
};

// 病历资料表单处理函数
const handleCaseFormSubmit = async (
  values: FieldValues,
  rowId: number
): Promise<void> => {
  try {
    console.log("病历资料表单提交:", values);
    await someApiCall(values);
    editState.case[rowId] = false;
    ElMessage.success("病历资料提交成功");
  } catch (error) {
    console.error("病历资料提交失败", error);
    ElMessage.error("病历资料提交失败，请重试");
  }
};

// 修改病历资料表单重置函数
const handleCaseFormReset = (rowId: number): void => {
  if (!editState.case[rowId]) {
    ElMessage.warning("当前不处于编辑状态，无法重置");
    return;
  }
  console.log("重置病历资料表单，行ID:", rowId);
  // 直接重置病历资料相关的字段
  expandedFormData[rowId].case = {
    admissionUltrasound: "",
    uSize: "",
    uBloodSignal: null,
    uBirads: ""
  };
};

onMounted(() => {
  loadTableData();
});
</script>

<template>
  <el-card :shadow="'never'">
    <template #default>
      <form-search
        :show="pageData.searchState"
        :form-field="pageData.searchField"
        :data-source="pageData.dataSource"
        @search-form="updateSearchForm"
        @search="handleSearch"
        @reset="resetSearch"
        :query-permission="pageData.permission.query"
      />
      <table-buttons
        :size="'small'"
        :left-btns="pageData.btnOpts.left"
        :right-btns="pageData.btnOpts.right"
        @click="handleBtnClick"
      />
      <pure-table
        :columns="tableColumns"
        :data="pageData.tableParams.list"
        :border="true"
        :stripe="true"
        :loading="pageData.tableParams.loading"
        :pagination="pageData.tableParams.pagination"
        :header-row-class-name="'table-header'"
        @page-current-change="
          page =>
            handlePageChange(page, pageData.tableParams.pagination.pageSize)
        "
        @page-size-change="
          size =>
            handlePageChange(pageData.tableParams.pagination.currentPage, size)
        "
        @expand-change="handleExpand"
      >
        <template #expand="{ row }">
          <div class="m-4">
            <PlusForm
              :key="row.id"
              v-model="expandedFormData[row.id].main"
              :disabled="expandedFormData[row.id].main.disabled"
              class="w-[80%] max-w-[1000px] m-auto"
              :columns="mainFormColumns"
              :rules="rules"
              label-position="right"
              @submit="handleMainFormSubmit"
              @reset="() => handleMainFormReset(row.id)"
              submitText="提交主表单"
              resetText="重置主表单"
              style="display: flex; flex-direction: column; align-items: center"
            />
            <el-collapse
              v-model="rowActiveNames[row.id]"
              class="w-[360px]"
              :accordion="true"
              @change="(val: CollapseModelValue) => handleCollapseChange(val, row.id)"
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 100%;
                margin-top: 20px;
              "
            >
              <el-collapse-item title="一般资料" name="1" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="病历资料" name="2" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.case">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>病历资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'case')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.case[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] && expandedFormData[row.id].case
                    "
                    :key="`case-${row.id}`"
                    v-model="expandedFormData[row.id].case"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generateCaseColumns(row.id)"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.case[row.id]"
                    lazy
                    @submit="values => handleCaseFormSubmit(values, row.id)"
                    @reset="() => handleCaseFormReset(row.id)"
                    submitText="提交病历资料"
                    resetText="重置病历资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="手术相关" name="3" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item
                title="新辅助治疗相关"
                name="4"
                style="width: 100%"
              >
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="辅助治疗" name="5" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="内分泌治疗" name="6" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item
                title="放射治疗相关"
                name="7"
                style="width: 100%"
              >
                <template v-if="rowDataLoading[row.id]?.general">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <div class="form-header">
                    <h3>一般资料</h3>
                    <el-button
                      @click="handleGeneralEdit(row.id, 'general')"
                      type="primary"
                      size="small"
                    >
                      {{ editState.general[row.id] ? "取消编辑" : "编辑" }}
                    </el-button>
                  </div>
                  <PlusForm
                    v-if="
                      expandedFormData[row.id] &&
                      expandedFormData[row.id].general
                    "
                    :key="`general-${row.id}`"
                    v-model="expandedFormData[row.id].general"
                    class="w-[80%] max-w-[1000px] m-auto"
                    :columns="generalFormColumns"
                    :rules="rules"
                    label-position="right"
                    @change="
                      (values, column) =>
                        handleFormChange(values, column, row.id)
                    "
                    :disabled="!editState.general[row.id]"
                    lazy
                    @submit="values => handleGeneralFormSubmit(values, row.id)"
                    @reset="() => handleGeneralFormReset(row.id)"
                    submitText="提交一般资料"
                    resetText="重置一般资料"
                    style="
                      display: flex;
                      flex-direction: column;
                      align-items: center;
                    "
                  />
                </template>
              </el-collapse-item>
            </el-collapse>
          </div>
        </template>

        <template #roleType="{ row }">
          <el-tag
            effect="plain"
            :type="enabledBooleanConvert(row.isSystem) ? 'danger' : ''"
          >
            {{ enabledBooleanConvert(row.isSystem) ? "内置" : "自定义" }}
          </el-tag>
        </template>

        <template #roleEnable="{ row }">
          <el-tag effect="plain" :type="row.enabled === 1 ? 'success' : 'info'">
            {{ enableConvert(row.enabled) }}
          </el-tag>
        </template>

        <template #operation="{ row }">
          <el-link
            v-show="hasAuth(pageData.permission.update) && row.isSystem !== 1"
            type="primary"
            @click="handleEdit(row, 'main')"
          >
            {{ editState.main[row.id] ? "退出编辑" : "编辑" }}
          </el-link>
          <el-divider
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            type="primary"
          >
            删除
          </el-link>
        </template>
      </pure-table>

      <patient-edit ref="patientEditRef" @ok="loadTableData" />
    </template>
  </el-card>
</template>

<style scoped>
::v-deep .el-form-item__label {
  width: 160px !important;
}

::v-deep .el-row {
  width: 100% !important;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
</style>
