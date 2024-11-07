<script setup lang="ts">
import { reactive, onMounted, ref } from "vue";
import { PureTable } from "@pureadmin/table";
// import { CollapseModelValue } from "element-plus";
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import RadiationEdit from "./modules/follow-edit.vue";
import { hasAuth } from "@/router/utils";
import { enableConvert, enabledBooleanConvert } from "@/constants/convert";
import { enableOptions, followUpStatusOptions } from "@/constants/constants";
import * as patientApi from "@/api/core/patient";
import * as followApi from "@/api/core/follow";
import "plus-pro-components/es/components/form/style/css";
import { ElMessage } from "element-plus";
import message from "@/utils/message";

defineOptions({ name: "corePatient" });
const radiationEditRef = ref();
// 引用和状态
// const patientEditRef = ref();
const childTableData = ref([]);

// 页面数据
const pageData: any = reactive({
  permission: {
    query: [],
    add: ["follow:save"],
    update: ["follow:update"],
    delete: ["follow:del"],
    record: ["follow:record"]
  },
  searchState: true,
  searchField: [
    {
      type: "input",
      label: "手术编号",
      prop: "surgicalNum",
      placeholder: "精准查询手术编号"
    },
    {
      type: "input",
      label: "病案号",
      prop: "caseNo",
      placeholder: "精准查询病案号"
    },
    {
      type: "input",
      label: "患者姓名",
      prop: "name",
      placeholder: "模糊查询患者姓名"
    }
    // {
    //   type: "select",
    //   label: "随访状态",
    //   prop: "enabled",
    //   placeholder: "请选择",
    //   dataSourceKey: "followUpStatusOptions",
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
    patientList: [],
    followUpStatusOptions: followUpStatusOptions,
    enabledOptions: enableOptions
  },
  searchForm: {},
  btnOpts: {
    left: [
      // {
      //   key: "add",
      //   label: "新增",
      //   type: "primary",
      //   icon: "ep:plus",
      //   state: true,
      //   permission: ["patient:save"]
      // }
    ],
    right: [
      // {
      //   key: "search",
      //   label: "查询",
      //   icon: "ep:search",
      //   state: true,
      //   options: {
      //     circle: true
      //   }
      // },
      // {
      //   key: "refresh",
      //   label: "刷新",
      //   icon: "ep:refresh",
      //   state: true,
      //   options: {
      //     circle: true
      //   }
      // }
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
    label: "手术编号",
    prop: "surgicalNum"
  },
  {
    label: "病案号",
    prop: "caseNo"
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
  // {
  //   label: "录入状态",
  //   prop: "inputStatus",
  //   formatter: row => {
  //     const statusMap = {
  //       0: "未开始",
  //       1: "进行中",
  //       2: "已完成"
  //     };
  //     return statusMap[row.inputStatus] || "未知";
  //   }
  // },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

const tableChildrenColumns: TableColumnList = [
  {
    type: "expand",
    slot: "expand"
  },
  {
    label: "术后X月随访记录",
    prop: "afterSurgeryDate"
  },
  {
    label: "随访日期",
    prop: "followUpDate"
  },
  {
    label: "随访状态",
    prop: "followUpStatus",
    slot: "status",
    width: "200"
  },
  {
    label: "创建者",
    prop: "createdBy"
  },
  {
    label: "创建时间",
    prop: "created"
  },
  {
    label: "更新者",
    prop: "modifiedBy"
  },
  {
    label: "更新时间",
    prop: "modified"
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation"
  }
];

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

/**
 * 删除患者信息
 */
// const handleDel = (record: any) => {
//   message.confirm("确认删除该患者全部数据").then(() => {
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

/**
 * 删除随访记录
 */
const handleFollowDel = (record: any) => {
  console.log(record);
  message.confirm("确认删除当前数据").then(() => {
    _delete_Follow([record.id], record.patientId);
  });
};
const _delete_Follow = (ids: any[], patientId: number) => {
  if (ids && ids.length > 0) {
    pageData.tableParams.loading = true;
    followApi
      .del(ids)
      .then(res => {
        if (res.success) {
          message.success("删除成功");
          loadChildrenTableData(patientId);
          // loadTableData();
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

  patientApi.patientQueryList().then((res: any) => {
    if (res.success) {
      pageData.dataSource.patientList = res.result;
      console.log(pageData.dataSource.patientList);
    }
  });

  followApi
    .followQueryPage(query)
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

const loadChildrenTableData = (patientId: number) => {
  const query = {
    patientId: patientId
  };
  followApi
    .followByPatientId(query)
    .then((res: any) => {
      if (res.success) {
        // 使用 Vue 的响应式 API 来更新子表格数据
        childTableData.value[patientId] = res.result;
        console.log(res.result);
        console.log(childTableData.value[patientId]);
      }
    })
    .catch(error => {
      console.error("加载子表格数据出错:", error);
      ElMessage.error("加载随访数据失败");
    });
};

//按钮跳转
const handleBtnClick = (action: string) => {
  switch (action) {
    case "add":
      _handlerAdd();
      break;
    case "search":
      toggleSearchState();
      break;
    case "refresh":
      loadTableData();
      break;
  }
};

/**
 * 新增
 */
// open函数接收五个参数，最后一个是判断当前操作是记录：0、编辑：1、新增：2。
const _handlerAdd = (row?: any) => {
  radiationEditRef.value!.open("", "", pageData.dataSource, row.id, 2);
};

const handleFollowAdded = (patientId: number) => {
  loadChildrenTableData(patientId);
};
// const handleEdit = (data: any) => {
//   radiationEditRef.value!.open(data, "修改病历资料", pageData.dataSource);
// };

/**
 * 获取随访状态标签的类型
 * @param {string} status 随访状态
 * @returns {string} 标签类型
 */
const getStatusTagType = (status: string) => {
  switch (status) {
    case "等待中":
      return "warning";
    case "待随访":
      return "danger";
    case "已完成":
      return "success";
    default:
      return "info";
  }
};

/**
 * 获取随访状态标签的文本
 * @param {string} status 随访状态
 * @returns {string} 标签文本
 */
const getStatusLabel = (status: string) => {
  return status;
};

//编辑函数
// const handleEdit = (row: any) => {
//   if (hasAuth(pageData.permission.update) && row.isSystem !== 1) {
//     // 实现编辑逻辑
//   } else {
//     ElMessage.error("您没有编辑权限");
//   }
// };

// 处理展开/折叠
const handleExpand = (row: any, expanded: boolean) => {
  if (expanded && !childTableData.value[row.id]) {
    loadChildrenTableData(row.id);
  }
};

// open函数接收五个参数，最后一个是判断当前操作是记录：0、编辑：1、新增：2。
const handleRecord = (data: any) => {
  radiationEditRef.value!.open(
    data,
    "记录随访记录",
    pageData.dataSource,
    "",
    0
  );
};

// open函数接收五个参数，最后一个是判断当前操作是记录：0、编辑：1、新增：2。
const handleEdit = (data: any) => {
  radiationEditRef.value!.open(
    data,
    "编辑随访记录",
    pageData.dataSource,
    "",
    1
  );
};

const handleChildExpand = (childRow: any, expanded: boolean) => {
  console.log("子行展开:", childRow, expanded);
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
          <pure-table
            style="margin-right: 10px"
            :columns="tableChildrenColumns"
            :data="childTableData[row.id] || []"
            :border="true"
            :stripe="true"
            :loading="false"
            :header-row-class-name="'table-header'"
            @expand-change="handleChildExpand"
          >
            <template #expand="{ row: childRow }">
              <div class="m-4">
                <h2>随访信息</h2>
                <br />
                <div>
                  <h3>术后{{ childRow.afterSurgeryDate }}月随访记录</h3>
                  <br />
                  <!-- <p class="mb-2">手术日期: {{ row.surgeryDate }}</p> -->
                  <p class="mb-2">随访日期: {{ childRow.followUpDate }}</p>
                  <p class="mb-2">随访状态: {{ childRow.followUpStatus }}</p>
                </div>
                <br />
                <div>
                  <h3>超声检查</h3>
                  <br />
                  <p class="mb-2">
                    超声是否异常:
                    {{ childRow.ultrasoundAbnormal ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    超声异常明细: {{ childRow.ultrasoundAbnormalDetail }}
                  </p>
                </div>
                <br />
                <div>
                  <h3>穿刺检查</h3>
                  <br />
                  <p class="mb-2">
                    是否需进一步穿刺:
                    {{ childRow.needFurtherBiopsy ? "是" : "否" }}
                  </p>
                  <p class="mb-2">穿刺结果: {{ childRow.biopsyResult }}</p>
                </div>
                <br />
                <div>
                  <h3>其他检查</h3>
                  <br />
                  <p class="mb-2">
                    是否有转移: {{ childRow.metastasis ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    转移部位: {{ childRow.metastasisLocation }}
                  </p>
                  <p class="mb-2">
                    是否已故: {{ childRow.deceased ? "是" : "否" }}
                  </p>
                  <p class="mb-2">已故原因: {{ childRow.causeOfDeath }}</p>
                  <p class="mb-2">
                    是否术后患侧上肢水肿: {{ childRow.armEdema ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    是否行针对上肢水肿的治疗:
                    {{ childRow.armEdemaTreatment ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    术后第{{ childRow.afterSurgeryDate }}月复查胸部CT是否异常:
                    {{ childRow.chestCtAbnormal ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    术后第{{ childRow.afterSurgeryDate }}月复查胸部CT异常结果:
                    {{ childRow.chestCtAbnormalResult }}
                  </p>
                  <p class="mb-2">
                    术后第{{ childRow.afterSurgeryDate }}月复查头颅MR是否异常:
                    {{ childRow.headMrAbnormal ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    术后第{{ childRow.afterSurgeryDate }}月复查头颅MR异常结果:
                    {{ childRow.headMrAbnormalResult }}
                  </p>
                  <p class="mb-2">
                    术后第{{
                      childRow.afterSurgeryDate
                    }}月复查全身骨扫描是否异常:
                    {{ childRow.boneScanAbnormal ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    术后第{{
                      childRow.afterSurgeryDate
                    }}月复查全身骨扫描异常结果:
                    {{ childRow.boneScanAbnormalResult }}
                  </p>
                  <p class="mb-2">量表评分: {{ childRow.scaleRating }}</p>
                  <p class="mb-2">
                    是否更改治疗方案:
                    {{ childRow.isChangeTreatmentPlan ? "是" : "否" }}
                  </p>
                  <p class="mb-2">
                    当前治疗方案:
                    {{ childRow.currentTreatmentPlan }}
                  </p>
                  <p class="mb-2">备注: {{ childRow.notes }}</p>
                </div>
                <br />
              </div>
            </template>
            <template #status="{ row }">
              <el-tag :type="getStatusTagType(row.followUpStatus)">
                {{ getStatusLabel(row.followUpStatus) }}
              </el-tag>
            </template>
            <template #operation="{ row }">
              <el-link
                v-show="
                  hasAuth(pageData.permission.record) &&
                  row.followUpStatus == '待随访'
                "
                type="primary"
                @click="handleRecord(row)"
                >记录</el-link
              >
              <el-divider
                v-show="
                  hasAuth(pageData.permission.update) &&
                  row.followUpStatus == '待随访'
                "
                direction="vertical"
              />
              <el-link
                v-show="
                  hasAuth(pageData.permission.update) && row.isSystem !== 1
                "
                type="primary"
                @click="handleEdit(row)"
                >编辑</el-link
              >
              <el-divider
                v-show="
                  hasAuth(pageData.permission.update) && row.isSystem !== 1
                "
                direction="vertical"
              />
              <el-link
                v-show="
                  hasAuth(pageData.permission.delete) && row.isSystem !== 1
                "
                type="primary"
                @click="handleFollowDel(row)"
              >
                删除
              </el-link>
            </template>
          </pure-table>
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
            @click="_handlerAdd(row)"
            >新增</el-link
          >
          <!-- <el-divider
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            type="primary"
            @click="handleDel(row)"
          >
            删除
          </el-link> -->
        </template>
      </pure-table>

      <radiation-edit
        ref="radiationEditRef"
        @follow-added="handleFollowAdded"
      />
    </template>
  </el-card>
</template>

<style scoped>
/* ::v-deep .el-row {
  width: 100% !important;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
} */
</style>
