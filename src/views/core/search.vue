<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { PureTable } from "@pureadmin/table";
import {
  PlusForm,
  type PlusColumn,
  type FieldValues
} from "plus-pro-components";
import { CollapseModelValue } from "element-plus";
// import FormSearch from "@/components/opts/form-search.vue";
// import TableButtons from "@/components/opts/btns2.vue";
import PatientEdit from "./modules/patient-edit.vue";
// import { hasAuth } from "@/router/utils";
import { enableConvert, enabledBooleanConvert } from "@/constants/convert";
import { enableOptions, sexOptions } from "@/constants/constants";
import * as patientApi from "@/api/core/patient";
import * as generalApi from "@/api/core/general";
import * as caseApi from "@/api/core/case";
import * as surgicalApi from "@/api/core/surgical";
import * as neoadjuvantApi from "@/api/core/neoadjuvant";
import * as adjuvantApi from "@/api/core/adjuvant";
import * as endocrineApi from "@/api/core/endocrine";
import * as radiationApi from "@/api/core/radiation";
import "plus-pro-components/es/components/form/style/css";
import { ElMessage } from "element-plus";
import message from "@/utils/message";
import GeneralInfo from "./modules/general-expand.vue";
import CaseInfo from "./modules/case-expand.vue";
import SurgeryInfo from "./modules/surgical-expand.vue";
import NeoadjuvantInfo from "./modules/neoadjuvant-expand.vue";
import AdjuvantInfo from "./modules/adjuvant-expand.vue";
import EndocrineInfo from "./modules/endocrine-expand.vue";
import RadiationInfo from "./modules/radiation-expand.vue";

defineOptions({ name: "corePatient" });

// 引用和状态
const patientEditRef = ref();
// const currentRowId = ref(null);
const rowActiveNames = ref<{ [key: number]: CollapseModelValue }>({});
const rowDataLoading = ref<{
  [key: number]: {
    general: boolean;
    case: boolean;
    surgical: boolean;
    neoadjuvant: boolean;
    adjuvant: boolean;
    endocrine: boolean;
    radiation: boolean;
  };
}>({});
const expandedFormData = reactive<{ [key: number]: any }>({});

// 页面数据
const pageData: any = reactive({
  permission: {
    query: [],
    search: ["search:query"],
    add: ["patient:save"],
    update: ["patient:update"],
    delete: ["patient:del"]
    // general_update: ["general:update"],
    // case_update: ["general:update"],
    // surgical_update: ["general:update"],
    // neoadjuvant_update: ["general:update"],
    // adjuvant_update: ["general:update"],
    // endocrine_update: ["general:update"],
    // radiation_update: ["general:update"]
  },
  searchState: true,
  isAdvancedSearch: false, // 新增：控制是否显示高级搜索
  searchField: [
    // {
    //   type: "input",
    //   label: "患者电话",
    //   prop: "phone",
    //   placeholder: "精准查询患者电话"
    // },
    // {
    //   type: "input",
    //   label: "联系人电话",
    //   prop: "contactPhone",
    //   placeholder: "精准查询联系人电话"
    // },
    // {
    //   type: "input",
    //   label: "患者姓名",
    //   prop: "name",
    //   placeholder: "模糊查询患者姓名"
    // },
    // // 新增高级搜索字段
    // {
    //   type: "input",
    //   label: "年龄",
    //   prop: "age",
    //   placeholder: "请输入年龄",
    //   isAdvanced: true
    // },
    // {
    //   type: "select",
    //   label: "性别",
    //   prop: "sex",
    //   placeholder: "请选择性别",
    //   options: [
    //     { label: "男", value: 1 },
    //     { label: "女", value: 0 }
    //   ],
    //   isAdvanced: true
    // }
    // {
    //   type: "select",
    //   label: "状态",
    //   prop: "enabled",
    //   placeholder: "请选择",
    //   dataSourceKey: "enabledOptions",
    //   options: {
    //     keys: {
    //       label: "label",
    //       value: "value",
    //       prop: "value"
    //     },
    //     filterable: true
    //   }
    // }
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
        0: "未录入",
        1: "录入中",
        2: "已录入"
      };
      return statusMap[row.inputStatus] || "未知";
    }
  }
  // {
  //   label: "操作",
  //   fixed: "right",
  //   slot: "operation"
  // }
];

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入名称" }],
  surgicalNum: [{ required: true, message: "请输入手术编号", trigger: "blur" }]
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

// 功能函数
// const updateSearchForm = (data: any) => {
//   pageData.searchForm = data;
// };

// const handleSearch = () => {
//   loadTableData();
// };

// const resetSearch = (data?: any) => {
//   pageData.searchForm = data || {};
// };

// const toggleSearchState = () => {
//   pageData.searchState = !pageData.searchState;
// };

const handlePageChange = (current: number, size: number) => {
  pageData.tableParams.pagination.currentPage = current;
  pageData.tableParams.pagination.pageSize = size;
  loadTableData();
};

/**
 * 删除
 */
// const handleDel = (record: any) => {
//   message.confirm("确认删除当前数据").then(() => {
//     _delete([record.id]);
//   });
// };
const _delete = (ids: any[]) => {
  if (ids && ids.length > 0) {
    pageData.tableParams.loading = true;
    patientApi
      .patientDel(ids)
      .then(res => {
        if (res.success) {
          message.success("删除成功");
          loadTableData();
        } else {
          message.warning(res.message);
        }
      })
      .finally(() => {
        pageData.tableParams.loading = false;
      });
  }
};

//表格数据加载函数
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

//按钮跳转
// const handleBtnClick = (action: string) => {
//   switch (action) {
//     case "add":
//       patientEditRef.value?.open();
//       break;
//     case "search":
//       toggleSearchState();
//       break;
//     case "refresh":
//       loadTableData();
//       break;
//   }
// };

//编辑函数
// const handleEdit = (row: any, type: "general" | "case" | "main") => {
//   if (hasAuth(pageData.permission.update) && row.isSystem !== 1) {
//     editState[type][String(row.id)] = !editState[type][String(row.id)];
//     // 更新表单项的禁用状态
//     expandedFormData[row.id][type] = {
//       ...expandedFormData[row.id][type],
//       disabled: !editState[type][String(row.id)]
//     };
//   } else {
//     ElMessage.error("您没有编辑权限");
//   }
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
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
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
          caseNo: generalData.caseNo,
          patientId: generalData.patientId,
          id: generalData.id
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
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
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

const loadSurgeryData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
  }
  rowDataLoading.value[id].surgical = true;

  const query = { patientId: id };

  surgicalApi
    .surgicalQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const surgicalData = res.result[0];

        const newSurgeryData = {
          id: surgicalData.id,
          patientId: surgicalData.patientId,
          surgeryTime: surgicalData.surgeryTime,
          isTotalPartial: surgicalData.isTotalPartial,
          isBreastConserve: surgicalData.isBreastConserve,
          isNippleSpare: surgicalData.isNippleSpare,
          isEndoscopic: surgicalData.isEndoscopic,
          isReconstruction: surgicalData.isReconstruction,
          reconMethod: surgicalData.reconMethod,
          tumorSizeCm: surgicalData.tumorSizeCm,
          hasLymphInvasion: surgicalData.hasLymphInvasion,
          hasNerveInvasion: surgicalData.hasNerveInvasion,
          postopPathGrade: surgicalData.postopPathGrade,
          isMultifocal: surgicalData.isMultifocal,
          tumorLocation: surgicalData.tumorLocation,
          hasSlnBiopsy: surgicalData.hasSlnBiopsy,
          useNs: surgicalData.useNs,
          preTad: surgicalData.preTad,
          slnCount: surgicalData.slnCount,
          slnMeta: surgicalData.slnMeta,
          slnMetaCount: surgicalData.slnMetaCount,
          slnMicroMetaCount: surgicalData.slnMicroMetaCount,
          slnItcCount: surgicalData.slnItcCount,
          ald: surgicalData.ald,
          aldStage: surgicalData.aldStage,
          aldCount: surgicalData.aldCount,
          aldMetaCount: surgicalData.aldMetaCount,
          aldMicroMetaCount: surgicalData.aldMicroMetaCount,
          aldItcCount: surgicalData.aldItcCount,
          apexMeta: surgicalData.apexMeta,
          imMeta: surgicalData.imMeta,
          ihcResult: surgicalData.ihcResult,
          erPct: surgicalData.erPct,
          prPct: surgicalData.prPct,
          her2: surgicalData.her2,
          ki67Pct: surgicalData.ki67Pct,
          arPct: surgicalData.arPct,
          fishTest: surgicalData.fishTest,
          tnm: surgicalData.tnm,
          stage: surgicalData.stage,
          subtype: surgicalData.subtype,
          mpLevel: surgicalData.mpLevel,
          inputStatus: surgicalData.inputStatus,
          createdBy: surgicalData.createdBy,
          created: surgicalData.created,
          modifiedBy: surgicalData.modifiedBy,
          modified: surgicalData.modified,
          isEnable: surgicalData.isEnable,
          isDel: surgicalData.isDel
        };

        expandedFormData[id] = {
          ...expandedFormData[id],
          surgical: { ...newSurgeryData },
          originalSurgery: { ...newSurgeryData }
        };
      } else {
        expandedFormData[id] = {
          ...expandedFormData[id],
          surgical: {},
          originalSurgery: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load surgical data:", error);
      expandedFormData[id] = {
        ...expandedFormData[id],
        surgical: {},
        originalSurgery: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].surgical = false;
    });
};

const loadNeoadjuvantData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
  }
  rowDataLoading.value[id].neoadjuvant = true;

  const query = { patientId: id };

  neoadjuvantApi
    .neoadjuvantQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const neoadjuvantData = res.result[0];

        const newNeoadjuvantData = {
          id: neoadjuvantData.id,
          patientId: neoadjuvantData.patientId,
          neoadjTherapy: neoadjuvantData.neoadjTherapy,
          clinResearch: neoadjuvantData.clinResearch,
          researchDetails: neoadjuvantData.researchDetails,
          therapyPlan: neoadjuvantData.therapyPlan,
          immunotherapy: neoadjuvantData.immunotherapy,
          week1Size: neoadjuvantData.week1Size,
          week2Size: neoadjuvantData.week2Size,
          week3Size: neoadjuvantData.week3Size,
          week4Size: neoadjuvantData.week4Size,
          week5Size: neoadjuvantData.week5Size,
          week6Size: neoadjuvantData.week6Size,
          week23Size: neoadjuvantData.week23Size,
          week45Size: neoadjuvantData.week45Size,
          week67Size: neoadjuvantData.week67Size,
          week8Size: neoadjuvantData.week8Size,
          doseAdjust: neoadjuvantData.doseAdjust,
          adjustReason: neoadjuvantData.adjustReason,
          therapyTerm: neoadjuvantData.therapyTerm,
          termReason: neoadjuvantData.termReason,
          gcsf: neoadjuvantData.gcsf,
          longGcsf: neoadjuvantData.longGcsf,
          inputStatus: neoadjuvantData.inputStatus
        };

        expandedFormData[id] = {
          ...expandedFormData[id],
          neoadjuvant: { ...newNeoadjuvantData },
          originalNeoadjuvant: { ...newNeoadjuvantData }
        };
      } else {
        expandedFormData[id] = {
          ...expandedFormData[id],
          neoadjuvant: {},
          originalNeoadjuvant: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load neoadjuvant data:", error);
      expandedFormData[id] = {
        ...expandedFormData[id],
        neoadjuvant: {},
        originalNeoadjuvant: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].neoadjuvant = false;
    });
};

const loadAdjuvantData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
  }
  rowDataLoading.value[id].adjuvant = true;

  const query = { patientId: id };

  adjuvantApi
    .adjuvantQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const adjuvantData = res.result[0];

        const newAdjuvantData = {
          id: adjuvantData.id,
          patientId: adjuvantData.patientId,
          adjuvantTherapy: adjuvantData.adjuvantTherapy,
          clinicalResearch: adjuvantData.clinicalResearch,
          researchDetails: adjuvantData.researchDetails,
          therapyPlan: adjuvantData.therapyPlan,
          intensifiedTherapy: adjuvantData.intensifiedTherapy,
          intensifiedPlan: adjuvantData.intensifiedPlan,
          doseAdjustment: adjuvantData.doseAdjustment,
          adjustmentReason: adjuvantData.adjustmentReason,
          therapyTermination: adjuvantData.therapyTermination,
          terminationReason: adjuvantData.terminationReason,
          inputStatus: adjuvantData.inputStatus
        };

        expandedFormData[id] = {
          ...expandedFormData[id],
          adjuvant: { ...newAdjuvantData },
          originalAdjuvant: { ...newAdjuvantData }
        };
      } else {
        expandedFormData[id] = {
          ...expandedFormData[id],
          adjuvant: {},
          originalAdjuvant: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load adjuvant data:", error);
      expandedFormData[id] = {
        ...expandedFormData[id],
        adjuvant: {},
        originalAdjuvant: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].adjuvant = false;
    });
};

const loadEndocrineData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
  }
  rowDataLoading.value[id].endocrine = true;

  const query = { patientId: id };

  endocrineApi
    .endocrineQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const endocrineData = res.result[0];

        const newEndocrineData = {
          id: endocrineData.id,
          patientId: endocrineData.patientId,
          endocrineTreatment: endocrineData.endocrineTreatment,
          clinicalResearch: endocrineData.clinicalResearch,
          clinicalResearchDetails: endocrineData.clinicalResearchDetails,
          treatmentPlan: endocrineData.treatmentPlan,
          enhancedTreatment: endocrineData.enhancedTreatment,
          enhancedPlan: endocrineData.enhancedPlan,
          dosageAdjustment: endocrineData.dosageAdjustment,
          adjustmentReason: endocrineData.adjustmentReason,
          medicationAdjustment: endocrineData.medicationAdjustment,
          medAdjustReason: endocrineData.medAdjustReason,
          inputStatus: endocrineData.inputStatus
        };

        expandedFormData[id] = {
          ...expandedFormData[id],
          endocrine: { ...newEndocrineData },
          originalEndocrine: { ...newEndocrineData }
        };
      } else {
        expandedFormData[id] = {
          ...expandedFormData[id],
          endocrine: {},
          originalEndocrine: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load endocrine data:", error);
      expandedFormData[id] = {
        ...expandedFormData[id],
        endocrine: {},
        originalEndocrine: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].endocrine = false;
    });
};

const loadRadiationData = (id: number) => {
  if (!rowDataLoading.value[id]) {
    rowDataLoading.value[id] = {
      general: false,
      case: false,
      surgical: false,
      neoadjuvant: false,
      adjuvant: false,
      endocrine: false,
      radiation: false
    };
  }
  rowDataLoading.value[id].radiation = true;

  const query = { patientId: id };

  radiationApi
    .radiationQueryList(query)
    .then((res: any) => {
      if (res.success && res.result.length > 0) {
        const radiationData = res.result[0];

        const newRadiationData = {
          id: radiationData.id,
          patientId: radiationData.patientId,
          radiationTreatment: radiationData.radiationTreatment,
          clinicalResearch: radiationData.clinicalResearch,
          clinicalResearchDetails: radiationData.clinicalResearchDetails,
          treatmentPlan: radiationData.treatmentPlan,
          treatmentLocation: radiationData.treatmentLocation,
          inputStatus: radiationData.inputStatus
        };

        expandedFormData[id] = {
          ...expandedFormData[id],
          radiation: { ...newRadiationData },
          originalRadiation: { ...newRadiationData }
        };
      } else {
        expandedFormData[id] = {
          ...expandedFormData[id],
          radiation: {},
          originalRadiation: {}
        };
      }
    })
    .catch(error => {
      console.error("Failed to load radiation data:", error);
      expandedFormData[id] = {
        ...expandedFormData[id],
        radiation: {},
        originalRadiation: {}
      };
    })
    .finally(() => {
      rowDataLoading.value[id].radiation = false;
    });
};

// 处理展开/折叠
const handleExpand = (row: any, expanded: boolean) => {
  if (expanded) {
    if (!expandedFormData[row.id]) {
      expandedFormData[row.id] = {
        main: { ...row, disabled: true },
        general: {},
        case: {},
        surgical: {},
        neoadjuvant: {},
        adjuvant: {},
        endocrine: {},
        radiation: {}
      };
    }
    if (!rowActiveNames.value[row.id]) {
      rowActiveNames.value[row.id] = [];
    }
    if (!rowDataLoading.value[row.id]) {
      rowDataLoading.value[row.id] = {
        general: false,
        case: false,
        surgical: false,
        neoadjuvant: false,
        adjuvant: false,
        endocrine: false,
        radiation: false
      };
    }
    // 当展开行时，立即加载数据
    loadGeneralData(row.id);
    loadCaseData(row.id);
    loadSurgeryData(row.id);
    loadNeoadjuvantData(row.id);
    loadAdjuvantData(row.id);
    loadEndocrineData(row.id);
    loadRadiationData(row.id);
  }
};

// 编辑状态
const editState: { [key: string]: { [key: string]: boolean } } = reactive({
  radiation: {},
  endocrine: {},
  adjuvant: {},
  neoadjuvant: {},
  surgical: {},
  general: {},
  case: {},
  main: {}
});

// 主表单处理函数
const handleMainFormSubmit = (values: FieldValues): Promise<void> => {
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
  // 获取原始数据
  const originalData =
    pageData.tableParams.list.find(item => item.id === Number(rowId)) || {};

  // 定义主表单的字段
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

  // 只重置主表单的字段
  const resetData = {
    ...expandedFormData[rowId], // 保留现有的其他数据
    ...Object.fromEntries(
      mainFormFields.map(field => [field, originalData[field] || ""])
    ),
    id: Number(rowId),
    disabled: true // 重置后设置为禁用状态
  };

  // 更新 expandedFormData
  expandedFormData[rowId] = resetData;

  // 退出编辑状态
  editState.main[rowId] = false;
};

// 计算属性：根据当前展开状态返回应该显示的搜索字段
// const visibleSearchFields = computed(() => {
//   return pageData.searchField.filter(
//     field => !field.isAdvanced || pageData.isAdvancedSearch
//   );
// });

// const advancedSearchModules = reactive({
//   patient: false,
//   general: false,
//   case: false,
//   surgical: false,
//   neoadjuvant: false,
//   adjuvant: false,
//   endocrine: false,
//   radiation: false
// });

const patientSearchForm = reactive({
  name: "",
  sex: "",
  age: null,
  address: "",
  phone: "",
  contactPhone: "",
  // minHeight: "",
  // maxHeight: "",
  height: null,
  weight: null,
  inputStatus: ""
});

const generalSearchForm = reactive({
  surgicalNum: "",
  caseNo: "",
  inputStatus: ""
});

const caseSearchForm = reactive({
  ultrasoundStatus: "",
  ultrasoundLeftSize: null,
  ultrasoundLeftBloodFlow: "",
  ultrasoundLeftBirads: "",
  ultrasoundRightSize: null,
  ultrasoundRightBloodFlow: "",
  ultrasoundRightBirads: "",

  // 入院钼靶检查
  mammographyStatus: "",
  mammographyLeftSize: null,
  mammographyLeftAggregation: "",
  mammographyLeftBirads: "",
  mammographyRightSize: null,
  mammographyRightAggregation: "",
  mammographyRightBirads: "",

  // 入院乳腺核磁检查
  mriStatus: "",
  mriLeftSize: null,
  mriLeftBloodFlow: "",
  mriLeftBirads: "",
  mriRightSize: null,
  mriRightBloodFlow: "",
  mriRightBirads: "",

  // 血常规检查
  wbc: null,
  rbc: null,
  platelets: null,

  // 肝功能检查
  alt: null,
  ast: null,
  alkalinePhosphatase: null,

  // 肾功能检查
  creatinine: null,
  bun: null,
  uricAcid: null,

  // 血脂检查
  triglycerides: null,
  ldl: null,

  // D-二聚体检查
  dimer: null,

  // 肿瘤标志物检查
  cea: null,
  ca153: null,
  ca125: null,

  //月经信息
  menstrualStatus: "",
  menopausalAge: null,
  personalMedicalHistory: "",
  familyHistory: "",

  // 乳腺粗针穿刺病理结果
  breastCoreNeedle: "",
  breastCoreNeedleResult: "",

  // 腋窝粗针穿刺病理结果
  axillaryCoreNeedle: "",
  axillaryCoreNeedleResult: "",

  // 腋窝细针穿刺病理结果
  axillaryFineNeedle: "",
  axillaryFineNeedleResult: "",

  // 锁骨上淋巴结穿刺病理结果
  collarboneLymphNeedle: "",
  collarboneLymphNeedleResult: "",

  p120: "",
  eCad: "",
  ck56: "",
  gata3: "",

  // 免疫组化结果
  ihcResult: "",
  erPct: null,
  prPct: null,
  her2: "",
  ki67Pct: null,
  arPct: null,
  fishTest: "",

  // TNM分期
  tnm: "",
  stage: "",

  // 亚型分型
  subtype: "",
  inputStatus: ""
});

const surgicalSearchForm = reactive({
  surgeryTime: null,
  surgicalSite: "",
  isTotalPartial: "",
  isBreastConserve: "",
  isNippleSpare: "",
  isEndoscopic: "",
  isReconstruction: "",
  reconMethod: "",
  tumorSizeCm: null,
  hasLymphInvasion: "",
  hasNerveInvasion: "",
  postopPathGrade: "",
  isMultifocal: "",
  tumorLocation: "",
  hasSlnBiopsy: "",
  useNs: "",
  preTad: "",
  slnCount: null,
  slnMeta: "",
  slnMetaCount: null,
  slnMicroMetaCount: null,
  slnItcCount: null,
  ald: "",
  aldStage: "",
  aldCount: null,
  aldMetaCount: null,
  aldMicroMetaCount: null,
  aldItcCount: null,
  apexMeta: "",
  imMeta: "",
  ihcResult: "",
  erPct: null,
  prPct: null,
  her2: "",
  ki67Pct: null,
  arPct: null,
  fishTest: "",
  tnm: "",
  stage: "",
  subtype: "",
  specialTypeTumors: null,
  mpLevel: "",
  rcb: "",
  p120: "",
  eCad: "",
  ck56: "",
  gata3: "",
  p63: "",
  p53: "",
  trps1: "",
  sam: "",
  egfr: "",
  inputStatus: ""
});

// 新辅助治疗搜索表单
const neoadjuvantSearchForm = reactive({
  neoadjTherapy: "",
  clinResearch: "",
  researchDetails: "",
  therapyPlan: "",
  immunotherapy: "",
  week1Size: null,
  week2Size: null,
  week3Size: null,
  week4Size: null,
  week5Size: null,
  week6Size: null,
  week7Size: null,
  week8Size: null,
  week23Size: null,
  week45Size: null,
  week67Size: null,
  doseAdjust: "",
  adjustReason: "",
  therapyTerm: "",
  termReason: "",
  gcsf: "",
  longGcsf: "",
  inputStatus: ""
});

// 辅助治疗搜索表单
const adjuvantSearchForm = reactive({
  adjuvantTherapy: "",
  clinicalResearch: "",
  researchDetails: "",
  therapyPlan: "",
  intensifiedTherapy: "",
  intensifiedPlan: "",
  doseAdjustment: "",
  adjustmentReason: "",
  therapyTermination: "",
  terminationReason: "",
  inputStatus: ""
});

// 内分泌治疗搜索表单
const endocrineSearchForm = reactive({
  endocrineTreatment: "",
  clinicalResearch: "",
  clinicalResearchDetails: "",
  treatmentPlan: "",
  enhancedTreatment: "",
  enhancedPlan: "",
  dosageAdjustment: "",
  adjustmentReason: "",
  medicationAdjustment: "",
  medAdjustReason: "",
  inputStatus: ""
});

// 放射治疗搜索表单
const radiationSearchForm = reactive({
  radiationTreatment: "",
  clinicalResearch: "",
  clinicalResearchDetails: "",
  treatmentPlan: "",
  treatmentLocation: "",
  inputStatus: ""
});

const handleAdvancedSearch = () => {
  const searchParams = {
    patientInfo: patientSearchForm,
    generalInfo: generalSearchForm,
    caseInfo: caseSearchForm,
    surgicalInfo: surgicalSearchForm,
    neoadjuvantInfo: neoadjuvantSearchForm,
    adjuvantInfo: adjuvantSearchForm,
    endocrineInfo: endocrineSearchForm,
    radiationInfo: radiationSearchForm,
    size: pageData.tableParams.pagination.pageSize,
    current: pageData.tableParams.pagination.currentPage
  };

  console.log(searchParams);

  pageData.tableParams.loading = true;

  patientApi
    .patientAllInfoQueryPage(searchParams)
    .then((res: any) => {
      if (res.success) {
        pageData.tableParams.list = res.result.records;
        pageData.tableParams.pagination.total = Number(res.result.total);
        ElMessage.success("搜索成功");
      } else {
        throw new Error(res.message || "搜索失败");
      }
    })
    .catch((error: Error) => {
      console.error("搜索失败", error);
      ElMessage.error(`搜索失败: ${error.message}`);
    })
    .finally(() => {
      pageData.tableParams.loading = false;
    });
};

const activeNames = ref([]);

onMounted(() => {
  loadTableData();
});
</script>

<template>
  <el-card :shadow="'never'">
    <template #default>
      <!-- <form-search
        :show="pageData.searchState"
        :form-field="visibleSearchFields"
        :data-source="pageData.dataSource"
        @search-form="updateSearchForm"
        @search="handleSearch"
        @reset="resetSearch"
        :query-permission="pageData.permission.query"
      /> -->

      <div class="advanced-search-area">
        <h3>高级搜索</h3>
        <el-collapse v-model="activeNames">
          <el-collapse-item title="患者信息" name="patient">
            <el-form :model="patientSearchForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="患者姓名">
                    <el-input
                      v-model="patientSearchForm.name"
                      placeholder="请输入患者姓名"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="性别">
                    <el-select
                      v-model="patientSearchForm.sex"
                      placeholder="请选择性别"
                      clearable
                    >
                      <el-option
                        v-for="option in sexOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="年龄">
                    <el-input-number
                      v-model="patientSearchForm.age"
                      :step="1"
                      style="width: 320px"
                      :precision="0"
                      :min="0"
                      :max="1000"
                      placeholder="请输入年龄"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="电话">
                    <el-input
                      v-model="patientSearchForm.phone"
                      placeholder="请输入电话"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="联系人电话">
                    <el-input
                      v-model="patientSearchForm.contactPhone"
                      placeholder="请输入联系人电话"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="住址">
                    <el-input
                      v-model="patientSearchForm.address"
                      placeholder="请输入住址"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                  <el-form-item label="身高范围">
                    <el-input
                      v-model="patientSearchForm.minHeight"
                      placeholder="最小身高"
                    />
                    <span style="margin: 0 5px">至</span>
                    <el-input
                      v-model="patientSearchForm.maxHeight"
                      placeholder="最大身高"
                    />
                  </el-form-item>
                </el-col> -->
                <el-col :span="8">
                  <el-form-item label="身高/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="patientSearchForm.height"
                      :step="0.01"
                      :precision="2"
                      :min="0"
                      :max="1000"
                      placeholder="请输入身高"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="体重/kg">
                    <el-input-number
                      style="width: 320px"
                      v-model="patientSearchForm.weight"
                      :step="0.01"
                      :precision="2"
                      :min="0"
                      :max="1000"
                      placeholder="请输入体重"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="patientSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="一般资料" name="general">
            <el-form :model="generalSearchForm" label-width="100px">
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="手术编号">
                    <el-input
                      v-model="generalSearchForm.surgicalNum"
                      placeholder="请输入手术编号"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="病案号">
                    <el-input
                      v-model="generalSearchForm.caseNo"
                      placeholder="请输入病案号"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="generalSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="病历资料" name="case">
            <el-form :model="caseSearchForm" label-width="100px">
              <!-- 入院超声检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="入院超声状态">
                    <el-select
                      v-model="caseSearchForm.ultrasoundStatus"
                      placeholder="请选择状态"
                      clearable
                    >
                      <el-option label="未做" value="0" />
                      <el-option label="左" value="1" />
                      <el-option label="右" value="2" />
                      <el-option label="双侧" value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左超声大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ultrasoundLeftSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左血流信号">
                    <el-select
                      v-model="caseSearchForm.ultrasoundLeftBloodFlow"
                      placeholder="请输入血流信号"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="左BIRADS">
                    <el-select
                      v-model="caseSearchForm.ultrasoundLeftBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右超声大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ultrasoundRightSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右血流信号">
                    <el-select
                      v-model="caseSearchForm.ultrasoundRightBloodFlow"
                      placeholder="请输入血流信号"
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="右BIRADS">
                    <el-select
                      v-model="caseSearchForm.ultrasoundRightBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 入院钼靶检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="入院钼靶状态">
                    <el-select
                      v-model="caseSearchForm.mammographyStatus"
                      placeholder="请选择状态"
                      clearable
                    >
                      <el-option label="未做" value="0" />
                      <el-option label="左" value="1" />
                      <el-option label="右" value="2" />
                      <el-option label="双侧" value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左钼靶大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.mammographyLeftSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左细小钙化影">
                    <el-select
                      v-model="caseSearchForm.mammographyLeftAggregation"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="左BIRADS">
                    <el-select
                      v-model="caseSearchForm.mammographyLeftBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右钼靶大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.mammographyRightSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右细小钙化影">
                    <el-select
                      v-model="caseSearchForm.mammographyRightAggregation"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="右BIRADS">
                    <el-select
                      v-model="caseSearchForm.mammographyRightBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 入院乳腺核磁检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="入院乳腺核磁状态">
                    <el-select
                      v-model="caseSearchForm.mriStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未做" value="0" />
                      <el-option label="左" value="1" />
                      <el-option label="右" value="2" />
                      <el-option label="双侧" value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左乳腺大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.mriLeftSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="左增强信号">
                    <el-select
                      v-model="caseSearchForm.mriLeftBloodFlow"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="廓清型" value="2" />
                      <el-option label="平台型" value="1" />
                      <el-option label="流入型" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="左BIRADS">
                    <el-select
                      v-model="caseSearchForm.mriLeftBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右乳腺大小/cm">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.mriRightSize"
                      :step="0.1"
                      :precision="1"
                      placeholder="请输入大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="右增强信号">
                    <el-select
                      v-model="caseSearchForm.mriRightBloodFlow"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="右BIRADS">
                    <el-select
                      v-model="caseSearchForm.mriRightBirads"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0类" value="0" />
                      <el-option label="1类" value="1" />
                      <el-option label="2类" value="2" />
                      <el-option label="3类" value="3" />
                      <el-option label="4A类" value="4A" />
                      <el-option label="4B类" value="4B" />
                      <el-option label="4C类" value="4C" />
                      <el-option label="5类" value="5" />
                      <el-option label="6类" value="6" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 血常规检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="白细胞计数 10⁹/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.wbc"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入白细胞计数"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="红细胞计数 10¹²/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.rbc"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入红细胞计数"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="血小板计数 10⁹/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.platelets"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入血小板计数"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 肝功能检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="谷丙转氨酶 U/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.alt"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入谷丙转氨酶"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="谷草转氨酶 U/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ast"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入谷草转氨酶"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="碱性磷酸酶 U/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.alkalinePhosphatase"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入碱性磷酸酶"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 肾功能检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="血肌酐 umol/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.creatinine"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入血肌酐"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="血清尿素 mmol/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.bun"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入血清尿素"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="尿酸 umol/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.uricAcid"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入尿酸值"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 血脂检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="甘油三酯 mmol/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.triglycerides"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入甘油三酯值"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="低密度脂蛋白 mmol/L">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ldl"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入低密度脂蛋白值"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- D-二聚体检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="D-二聚体 ug/ml">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.dimer"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入D-二聚体值"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 肿瘤标志物检查 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="癌胚抗原 ng/mL">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.cea"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入CEA值"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="癌抗原153 IU/mL">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ca153"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入CA153值"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="癌抗原125 IU/mL">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ca125"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入CA125值"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="月经状态">
                    <el-select
                      v-model="caseSearchForm.menstrualStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="绝经" value="绝经" />
                      <el-option label="未绝经" value="未绝经" />
                      <el-option label="子宫切除" value="子宫切除" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="绝经年龄">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.menopausalAge"
                      :step="1"
                      :precision="0"
                      :min="0"
                      :max="1000"
                      placeholder="请输入绝经年龄"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="个人既往史">
                    <el-input
                      v-model="caseSearchForm.personalMedicalHistory"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入个人既往史"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="家族史">
                    <el-input
                      v-model="caseSearchForm.familyHistory"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入家族史"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="有无乳腺粗针穿刺">
                    <el-select
                      v-model="caseSearchForm.breastCoreNeedle"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="乳腺粗针穿刺病理结果">
                    <el-input
                      v-model="caseSearchForm.breastCoreNeedleResult"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入乳腺粗针穿刺病理结果"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 腋窝粗针穿刺病理结果 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="有无腋窝粗针穿刺">
                    <el-select
                      v-model="caseSearchForm.axillaryCoreNeedle"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="腋窝粗针穿刺病理结果">
                    <el-input
                      v-model="caseSearchForm.axillaryCoreNeedleResult"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入腋窝粗针穿刺病理结果"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 腋窝细针穿刺病理结果 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="有无腋窝细针穿刺">
                    <el-select
                      v-model="caseSearchForm.axillaryFineNeedle"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="腋窝细针穿刺病理结果">
                    <el-input
                      v-model="caseSearchForm.axillaryFineNeedleResult"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入腋窝细针穿刺病理结果"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 锁骨上淋巴结穿刺病理结果 -->
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="有无锁骨上淋巴结穿刺">
                    <el-select
                      v-model="caseSearchForm.collarboneLymphNeedle"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="锁骨上淋巴结穿刺病理结果">
                    <el-input
                      v-model="caseSearchForm.collarboneLymphNeedleResult"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入锁骨上淋巴结穿刺病理结果"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="P120">
                    <el-input
                      v-model="caseSearchForm.p120"
                      placeholder="请输入P120"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="E-cad">
                    <el-input
                      v-model="caseSearchForm.eCad"
                      placeholder="请输入E-cad"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="CK5/6">
                    <el-input
                      v-model="caseSearchForm.ck56"
                      placeholder="请输入CK5/6"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="GATA3">
                    <el-input
                      v-model="caseSearchForm.gata3"
                      placeholder="请输入GATA3"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- 免疫组化结果 -->
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="有无免疫组化结果">
                    <el-select
                      v-model="caseSearchForm.ihcResult"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="IHC ER%">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.erPct"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入ER%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="IHC PR%">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.prPct"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入PR%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="HER2">
                    <el-select
                      v-model="caseSearchForm.her2"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="3+" value="3+" />
                      <el-option label="2+" value="2+" />
                      <el-option label="1+" value="1+" />
                      <el-option label="0" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Ki-67标志物%">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.ki67Pct"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入Ki-67%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="AR%">
                    <el-input-number
                      style="width: 320px"
                      v-model="caseSearchForm.arPct"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入AR%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="FISH检测">
                    <el-select
                      v-model="caseSearchForm.fishTest"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="阳性" value="阳性" />
                      <el-option label="阴性" value="阴性" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <!-- TNM分期 -->
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="TNM分期">
                    <el-select
                      v-model="caseSearchForm.tnm"
                      placeholder="请选择TNM分期"
                      clearable
                    >
                      <el-option label="cT" value="cT" />
                      <el-option label="N" value="N" />
                      <el-option label="M" value="M" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="病理分级">
                    <el-select
                      v-model="caseSearchForm.stage"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="无" value="无" />
                      <el-option label="I" value="I" />
                      <el-option label="II" value="II" />
                      <el-option label="III" value="III" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="亚型分型">
                    <el-select
                      v-model="caseSearchForm.subtype"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="三阴性" value="三阴性" />
                      <el-option label="Luminal A" value="Luminal A" />
                      <el-option
                        label="Luminal B HER2阴性型"
                        value="Luminal B HER2阴性型"
                      />
                      <el-option
                        label="Luminal B HER2阳性型"
                        value="Luminal B HER2阳性型"
                      />
                      <el-option label="HER2阳性型" value="HER2阳性型" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="caseSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <!-- 病历资料的搜索字段 -->
          </el-collapse-item>

          <el-collapse-item title="手术相关" name="surgical">
            <el-form :model="surgicalSearchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="手术时间">
                    <el-date-picker
                      v-model="surgicalSearchForm.surgeryTime"
                      type="date"
                      placeholder="选择日期"
                      valueFormat="YYYY-MM-DD"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="手术部位">
                    <el-select
                      v-model="surgicalSearchForm.surgicalSite"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="左" value="左" />
                      <el-option label="右" value="右" />
                      <el-option label="双侧" value="双侧" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否全乳切除">
                    <el-select
                      v-model="surgicalSearchForm.isTotalPartial"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否保乳">
                    <el-select
                      v-model="surgicalSearchForm.isBreastConserve"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否保留乳头">
                    <el-select
                      v-model="surgicalSearchForm.isNippleSpare"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否内窥镜手术">
                    <el-select
                      v-model="surgicalSearchForm.isEndoscopic"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否重建">
                    <el-select
                      v-model="surgicalSearchForm.isReconstruction"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="重建方法">
                    <el-select
                      v-model="surgicalSearchForm.reconMethod"
                      placeholder="请选择重建方法"
                    >
                      <el-option label="自体" value="自体" />
                      <el-option label="假体" value="假体" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="肿瘤大小(cm)">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.tumorSizeCm"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入肿瘤大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="有无脉管癌栓">
                    <el-select
                      v-model="surgicalSearchForm.hasLymphInvasion"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="有无神经侵犯">
                    <el-select
                      v-model="surgicalSearchForm.hasNerveInvasion"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否多发">
                    <el-select
                      v-model="surgicalSearchForm.isMultifocal"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="肿瘤位置">
                    <el-select
                      v-model="surgicalSearchForm.tumorLocation"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="中央区" value="中央区" />
                      <el-option label="外上象限" value="外上象限" />
                      <el-option label="内上象限" value="内上象限" />
                      <el-option label="外下象限" value="外下象限" />
                      <el-option label="内下象限" value="内下象限" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否前哨淋巴结活检">
                    <el-select
                      v-model="surgicalSearchForm.hasSlnBiopsy"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否使用核素">
                    <el-select
                      v-model="surgicalSearchForm.useNs"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否新辅助前TAD">
                    <el-select
                      v-model="surgicalSearchForm.preTad"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="前哨淋巴结数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.slnCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否前哨淋巴结转移">
                    <el-select
                      v-model="surgicalSearchForm.slnMeta"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="前哨淋巴结转移数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.slnMetaCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="前哨淋巴结微转移数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.slnMicroMetaCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="前哨孤立肿瘤细胞数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.slnItcCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否腋窝淋巴结清扫">
                    <el-select
                      v-model="surgicalSearchForm.ald"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="腋窝淋巴结清扫分级">
                    <el-select
                      v-model="surgicalSearchForm.aldStage"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="I" value="I" />
                      <el-option label="II" value="II" />
                      <el-option label="III" value="III" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="腋窝清扫淋巴结数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.aldCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="腋窝淋巴结转移数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.aldMetaCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="腋窝微转移数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.aldMicroMetaCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="腋窝孤立肿瘤细胞数量/个">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.aldItcCount"
                      :min="0"
                      :precision="0"
                      :step="1"
                      placeholder="请输入数量"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否有腋尖淋巴结转移">
                    <el-select
                      v-model="surgicalSearchForm.apexMeta"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有肌间淋巴结转移">
                    <el-select
                      v-model="surgicalSearchForm.imMeta"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后有无免疫组化结果">
                    <el-select
                      v-model="surgicalSearchForm.ihcResult"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="有" value="1" />
                      <el-option label="无" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="术后ER%">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.erPct"
                      :min="0"
                      :max="100"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入术后ER%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后PR%">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.prPct"
                      :min="0"
                      :max="100"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入术后PR%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后HER2">
                    <el-select
                      v-model="surgicalSearchForm.her2"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="0" value="0" />
                      <el-option label="1+" value="1+" />
                      <el-option label="2+" value="2+" />
                      <el-option label="3+" value="3+" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="术后ki67%">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.ki67Pct"
                      :min="0"
                      :max="100"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入术后ki67%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后AR%">
                    <el-input-number
                      style="width: 320px"
                      v-model="surgicalSearchForm.arPct"
                      :min="0"
                      :max="100"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入术后AR%"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                  <el-form-item label="Miller-Payne系统分级">
                    <el-select
                      v-model="surgicalSearchForm.postopPathGrade"
                      placeholder="请选择"
                    >
                      <el-option label="1" value="1" />
                      <el-option label="2" value="2" />
                      <el-option label="3" value="3" />
                      <el-option label="4" value="4" />
                      <el-option label="5" value="5" />
                    </el-select>
                  </el-form-item>
                </el-col> -->
                <el-col :span="8">
                  <el-form-item label="术后Fish检测">
                    <el-select
                      v-model="surgicalSearchForm.fishTest"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="阳性" value="阳性" />
                      <el-option label="阴性" value="阴性" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="术后TNM分期">
                    <el-select
                      v-model="surgicalSearchForm.tnm"
                      placeholder="请选择TNM分期"
                    >
                      <el-option label="cT" value="cT" />
                      <el-option label="N" value="N" />
                      <el-option label="M" value="M" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后病理分级">
                    <el-select
                      v-model="surgicalSearchForm.stage"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="无" value="无" />
                      <el-option label="I" value="I" />
                      <el-option label="II" value="II" />
                      <el-option label="III" value="III" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="术后分型">
                    <el-select
                      v-model="surgicalSearchForm.subtype"
                      placeholder="请选择分型"
                      clearable
                    >
                      <el-option label="三阴性" value="三阴性" />
                      <el-option label="Luminal A" value="Luminal A" />
                      <el-option
                        label="Luminal B HER2阴性型"
                        value="Luminal B HER2阴性型"
                      />
                      <el-option
                        label="Luminal B HER2阳性型"
                        value="Luminal B HER2阳性型"
                      />
                      <el-option label="HER2阳性型" value="HER2阳性型" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="特殊类型肿瘤">
                    <el-select
                      v-model="surgicalSearchForm.specialTypeTumors"
                      placeholder="请选择特殊类型肿瘤"
                      clearable
                    >
                      <el-option label="原位癌" value="原位癌" />
                      <el-option label="Paget’s病" value="Paget’s病" />
                      <el-option label="小叶癌" value="小叶癌" />
                      <el-option label="粘液癌" value="粘液癌" />
                      <el-option label="筛状癌" value="筛状癌" />
                      <el-option label="化生性癌" value="化生性癌" />
                      <el-option label="乳头状癌" value="乳头状癌" />
                      <el-option label="髓样癌" value="髓样癌" />
                      <el-option
                        label="神经内分泌肿瘤"
                        value="神经内分泌肿瘤"
                      />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="术后MP级别">
                    <el-select
                      v-model="surgicalSearchForm.mpLevel"
                      placeholder="请选择MP级别"
                      clearable
                    >
                      <el-option label="无浸润(MP0)" value="1" />
                      <el-option label="微浸润(MP1)" value="2" />
                      <el-option label="中度浸润(MP2)" value="3" />
                      <el-option label="重度浸润(MP3)" value="4" />
                      <el-option label="完全浸润(MP4)" value="5" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="RCB评分">
                    <el-select
                      v-model="surgicalSearchForm.rcb"
                      placeholder="请选择RCB评分"
                      clearable
                    >
                      <el-option label="0" value="0" />
                      <el-option label="1" value="1" />
                      <el-option label="2" value="2" />
                      <el-option label="3" value="3" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="P120">
                    <el-input
                      v-model="surgicalSearchForm.p120"
                      placeholder="请输入P120"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="E-cad">
                    <el-input
                      v-model="surgicalSearchForm.eCad"
                      placeholder="请输入E-cad"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="CK5/6">
                    <el-input
                      v-model="surgicalSearchForm.ck56"
                      placeholder="请输入CK5/6"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="GATA3">
                    <el-select
                      v-model="surgicalSearchForm.gata3"
                      placeholder="请输入GATA3"
                    >
                      <el-option label="阳性" value="1" />
                      <el-option label="阴性" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="P63">
                    <el-input
                      v-model="surgicalSearchForm.p63"
                      placeholder="请输入P63"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="P53">
                    <el-input
                      v-model="surgicalSearchForm.p53"
                      placeholder="请输入P53"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="TRPS1">
                    <el-input
                      v-model="surgicalSearchForm.trps1"
                      placeholder="请输入TRPS1"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="SAM">
                    <el-input
                      v-model="surgicalSearchForm.sam"
                      placeholder="请输入SAM"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="EGFR">
                    <el-input
                      v-model="surgicalSearchForm.egfr"
                      placeholder="请输入EGFR"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="surgicalSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="新辅助治疗" name="neoadjuvant">
            <el-form :model="neoadjuvantSearchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否进行新辅助治疗">
                    <el-select
                      v-model="neoadjuvantSearchForm.neoadjTherapy"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="临床研究">
                    <el-select
                      v-model="neoadjuvantSearchForm.clinResearch"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体临床研究">
                    <el-input
                      v-model="neoadjuvantSearchForm.researchDetails"
                      type="textarea"
                      placeholder="请输入具体临床研究"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="具体新辅助治疗方案">
                    <el-input
                      v-model="neoadjuvantSearchForm.therapyPlan"
                      type="textarea"
                      placeholder="请输入具体新辅助治疗方案"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有免疫药物应用">
                    <el-select
                      v-model="neoadjuvantSearchForm.immunotherapy"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="1周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week1Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入1周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="2周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week2Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入2周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="3周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week3Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入3周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="4周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week4Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入4周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="5周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week5Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入5周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="6周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week6Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入6周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="7周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week7Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入7周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="8周期超声示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week8Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入8周期超声示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="2/3周期核磁示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week23Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入2/3周期核磁示肿物大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="4/5周期核磁示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week45Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入4/5周期核磁示肿物大小"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="6/7周期核磁示肿物大小">
                    <el-input-number
                      style="width: 320px"
                      v-model="neoadjuvantSearchForm.week67Size"
                      :step="0.01"
                      :precision="2"
                      placeholder="请输入6/7周期核磁示肿物大小"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否有新辅助药物剂量调整">
                    <el-select
                      v-model="neoadjuvantSearchForm.doseAdjust"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="新辅助药物剂量调整原因">
                    <el-input
                      v-model="neoadjuvantSearchForm.adjustReason"
                      type="textarea"
                      placeholder="请输入新辅助药物剂量调整原因"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否终止新辅助治疗">
                    <el-select
                      v-model="neoadjuvantSearchForm.therapyTerm"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="终止新辅助治疗原因">
                    <el-input
                      v-model="neoadjuvantSearchForm.termReason"
                      type="textarea"
                      placeholder="请输入终止原因"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有升白针应用">
                    <el-select
                      v-model="neoadjuvantSearchForm.gcsf"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有长效升白针应用">
                    <el-select
                      v-model="neoadjuvantSearchForm.longGcsf"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="neoadjuvantSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="辅助治疗" name="adjuvant">
            <el-form :model="adjuvantSearchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否进行辅助治疗">
                    <el-select
                      v-model="adjuvantSearchForm.adjuvantTherapy"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否加入临床研究">
                    <el-select
                      v-model="adjuvantSearchForm.clinicalResearch"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体临床研究">
                    <el-input
                      v-model="adjuvantSearchForm.researchDetails"
                      type="textarea"
                      placeholder="请输入具体临床研究"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="具体辅助治疗方案">
                    <el-input
                      v-model="adjuvantSearchForm.therapyPlan"
                      type="textarea"
                      placeholder="请输入具体辅助治疗方案"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有强化治疗应用">
                    <el-select
                      v-model="adjuvantSearchForm.intensifiedTherapy"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体强化辅助治疗方案">
                    <el-input
                      v-model="adjuvantSearchForm.intensifiedPlan"
                      type="textarea"
                      placeholder="请输入具体强化辅助治疗方案"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否有辅助药物剂量调整">
                    <el-select
                      v-model="adjuvantSearchForm.doseAdjustment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="辅助药物剂量调整原因">
                    <el-input
                      v-model="adjuvantSearchForm.adjustmentReason"
                      type="textarea"
                      placeholder="请输入调整原因"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否终止辅助治疗">
                    <el-select
                      v-model="adjuvantSearchForm.therapyTermination"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="终止辅助治疗原因">
                    <el-input
                      v-model="adjuvantSearchForm.terminationReason"
                      type="textarea"
                      placeholder="请输入终止原因"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="adjuvantSearchForm.inputStatus"
                      placeholder="请选择"
                    >
                      <el-option label="未开始" value="0" />
                      <el-option label="进行中" value="1" />
                      <el-option label="已完成" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col> -->
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="adjuvantSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="内分泌治疗" name="endocrine">
            <el-form :model="endocrineSearchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否进行内分泌治疗">
                    <el-select
                      v-model="endocrineSearchForm.endocrineTreatment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否加入临床研究">
                    <el-select
                      v-model="endocrineSearchForm.clinicalResearch"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体临床研究">
                    <el-input
                      v-model="endocrineSearchForm.clinicalResearchDetails"
                      type="textarea"
                      placeholder="请输入临床研究详情"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="具体内分泌治疗方案">
                    <el-input
                      v-model="endocrineSearchForm.treatmentPlan"
                      type="textarea"
                      placeholder="请输入治疗方案"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有内分泌强化治疗应用">
                    <el-select
                      v-model="endocrineSearchForm.enhancedTreatment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体强化内分泌治疗方案">
                    <el-input
                      v-model="endocrineSearchForm.enhancedPlan"
                      type="textarea"
                      placeholder="请输入强化方案"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否有内分泌剂量调整">
                    <el-select
                      v-model="endocrineSearchForm.dosageAdjustment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="内分泌药物剂量调整原因">
                    <el-input
                      v-model="endocrineSearchForm.adjustmentReason"
                      type="textarea"
                      placeholder="请输入调整原因"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否有内分泌药物调整">
                    <el-select
                      v-model="endocrineSearchForm.medicationAdjustment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="内分泌药物调整原因">
                    <el-input
                      v-model="endocrineSearchForm.medAdjustReason"
                      type="textarea"
                      placeholder="请输入药物调整原因"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="endocrineSearchForm.inputStatus"
                      placeholder="请选择"
                    >
                      <el-option label="未开始" value="0" />
                      <el-option label="进行中" value="1" />
                      <el-option label="已完成" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col> -->
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="endocrineSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>

          <el-collapse-item title="放射治疗" name="radiation">
            <el-form :model="radiationSearchForm" label-width="120px">
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="是否进行放射治疗">
                    <el-select
                      v-model="radiationSearchForm.radiationTreatment"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="是否加入临床研究">
                    <el-select
                      v-model="radiationSearchForm.clinicalResearch"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="是" value="1" />
                      <el-option label="否" value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="具体临床研究">
                    <el-input
                      v-model="radiationSearchForm.clinicalResearchDetails"
                      type="textarea"
                      placeholder="请输入临床研究详情"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="具体放疗方案">
                    <el-input
                      v-model="radiationSearchForm.treatmentPlan"
                      type="textarea"
                      placeholder="请输入具体放疗方案"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="放疗部位">
                    <el-input
                      v-model="radiationSearchForm.treatmentLocation"
                      placeholder="请输入放疗部位"
                    />
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="radiationSearchForm.inputStatus"
                      placeholder="请选择"
                    >
                      <el-option label="未开始" value="0" />
                      <el-option label="进行中" value="1" />
                      <el-option label="已完成" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col> -->
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="录入状态">
                    <el-select
                      v-model="radiationSearchForm.inputStatus"
                      placeholder="请选择"
                      clearable
                    >
                      <el-option label="未录入" value="0" />
                      <el-option label="录入中" value="1" />
                      <el-option label="已录入" value="2" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-collapse-item>
        </el-collapse>
        <div class="search-button-container">
          <el-button type="primary" @click="handleAdvancedSearch"
            >搜索</el-button
          >
        </div>
      </div>

      <!-- <table-buttons
        :size="'small'"
        :left-btns="pageData.btnOpts.left"
        :right-btns="pageData.btnOpts.right"
        @click="handleBtnClick"
      /> -->
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
                  <GeneralInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].general"
                    v-model:is-editing="editState.general[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="病历资料" name="2" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.case">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <CaseInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].case"
                    v-model:is-editing="editState.case[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="手术相关" name="3" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.surgical">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <SurgeryInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].surgical"
                    v-model:is-editing="editState.surgical[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="新辅助治疗" name="4" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.neoadjuvant">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <NeoadjuvantInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].neoadjuvant"
                    v-model:is-editing="editState.neoadjuvant[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="辅助治疗" name="5" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.adjuvant">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <AdjuvantInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].adjuvant"
                    v-model:is-editing="editState.adjuvant[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="内分泌治疗" name="6" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.endocrine">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <EndocrineInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].endocrine"
                    v-model:is-editing="editState.endocrine[row.id]"
                    :permissions="pageData.permission"
                  />
                </template>
              </el-collapse-item>

              <el-collapse-item title="放射治疗" name="7" style="width: 100%">
                <template v-if="rowDataLoading[row.id]?.radiation">
                  <el-skeleton :rows="3" animated />
                </template>
                <template v-else>
                  <RadiationInfo
                    :row-id="row.id"
                    v-model:form-data="expandedFormData[row.id].radiation"
                    v-model:is-editing="editState.radiation[row.id]"
                    :permissions="pageData.permission"
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

        <!-- <template #operation="{ row }">
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
            @click="handleDel(row)"
          >
            删除
          </el-link>
        </template> -->
      </pure-table>

      <patient-edit ref="patientEditRef" @ok="loadTableData" />
    </template>
  </el-card>
</template>

<style scoped>
::v-deep .el-form-item__label {
  width: 190px !important;
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

.advanced-search-area {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.advanced-search-area h3 {
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: bold;
}

.search-modules {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-modules .el-checkbox {
  margin-right: 15px;
}

.search-button-container {
  margin-top: 15px;
}
</style>
