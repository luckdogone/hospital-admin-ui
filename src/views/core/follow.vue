<script setup lang="ts">
import FormSearch from "@/components/opts/form-search.vue";
import TableButtons from "@/components/opts/btns2.vue";
import { PureTable } from "@pureadmin/table";
import { hasAuth } from "@/router/utils";
import message from "@/utils/message";
// import { enableConvert, enabledBooleanConvert } from "@/constants/convert";
import { enableOptions } from "@/constants/constants";
import * as followApi from "@/api/core/follow";
import * as patientApi from "@/api/core/patient";
import RadiationEdit from "./modules/follow-edit.vue";
import { reactive, onMounted, ref } from "vue";
const radiationEditRef = ref();
// const rolePermissionRef = ref();
const pageData: any = reactive({
  permission: {
    query: [],
    add: ["role:save"],
    update: ["role:update"],
    delete: ["role:update"],
    permission: ["role:permission"]
  },
  /**
   * 是否显示搜索
   */
  searchState: true,
  /*搜索字段定义 */
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
    patientList: [],
    enabledOptions: enableOptions
  },
  searchForm: {},
  /*按钮 */
  btnOpts: {
    left: [
      {
        key: "add",
        label: "新增",
        type: "primary",
        icon: "ep:plus",
        state: true,
        permission: ["org:save"]
      }
      // {
      //   key: "update",
      //   label: "修改",
      //   type: "success",
      //   icon: "ep:edit",
      //   state: false,
      //   permission: ["org:update"]
      // }
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
    /**
     * table column
     */
    columns: [
      // {
      //   label: "手术编号",
      //   prop: "patientNo"
      // },
      // {
      //   label: "患者姓名",
      //   prop: "name"
      // },
      // {
      //   label: "患者性别",
      //   prop: "gender"
      // },
      // {
      //   label: "患者年龄",
      //   prop: "age"
      // },
      // {
      //   label: "病案编号",
      //   prop: "caseNo"
      // },
      // {
      //   label: "住址",
      //   prop: "address"
      // },
      // {
      //   label: "患者电话",
      //   prop: "phone"
      // },
      // {
      //   label: "联系人电话",
      //   prop: "contactPhone"
      // },
      // {
      //   label: "患者身高",
      //   prop: "height"
      // },
      // {
      //   label: "患者体重",
      //   prop: "weight"
      // },
      // {
      //   label: "患者BMI",
      //   props: "bmi"
      // },
      // {
      //   label: "创建时间",
      //   prop: "created"
      // },
      // {
      //   label: "操作",
      //   fixed: "right",
      //   slot: "operation"
      // }
    ],
    /**
     * table data
     */
    list: [],
    /*加载 */
    loading: false,
    /*数据 */
    tableData: [],
    currentData: {},
    pagination: {
      pageSize: 10,
      defaultPageSize: 10,
      currentPage: 1,
      background: true,
      total: 0
    }
  }
});

const columns = [
  {
    type: "expand",
    slot: "expand"
  },
  {
    label: "手术编号",
    prop: "surgicalNum",
    width: "200"
  },
  {
    label: "患者姓名",
    prop: "name",
    width: "200"
  },
  {
    label: "患者性别",
    prop: "sex",
    slot: "sex",
    width: "200"
  },
  {
    label: "患者年龄",
    prop: "age",
    width: "200"
  },
  {
    label: "病案号",
    prop: "caseNo",
    width: "200"
  },
  {
    label: "随访状态",
    prop: "followUpStatus",
    slot: "status",
    width: "200"
  },
  {
    label: "创建者",
    prop: "createdBy",
    width: "200"
  },
  {
    label: "创建时间",
    prop: "created",
    width: "200"
  },
  {
    label: "更新者",
    prop: "modifiedBy",
    width: "200"
  },
  {
    label: "更新时间",
    prop: "modified",
    width: "200"
  },
  {
    label: "操作",
    fixed: "right",
    slot: "operation",
    width: "150"
  }
];

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

/**
 *  更新搜索表单
 * @param data .
 */
const _updateSearchFormData = (data: any) => {
  pageData.searchForm = data;
};
/**
 * 点击搜索按钮
 */
const _searchForm = (data: any) => {
  pageData.searchForm = data;
  _loadData();
};
/**
 * 重置
 */
const _resetSearchForm = (data?: any) => {
  pageData.searchForm = data;
};
/**
 * 更新搜索表达的状态
 */
const _updateSearchState = () => {
  pageData.searchState = !pageData.searchState;
};
const handleChangePageSize = (val: any) => {
  pageData.tableParams.pagination.pageSize = val;
  _loadData();
};
const handleChangeCurrentPage = (val: any) => {
  pageData.tableParams.pagination.currentPage = val;
  _loadData();
};
const getQueryParams = () => {
  const sqp = {};
  const param = Object.assign(sqp, pageData.searchForm);
  param.current = pageData.tableParams.pagination.currentPage;
  param.size = pageData.tableParams.pagination.pageSize;
  return param;
};
/**
 * 查询数据
 */
const _loadData = () => {
  pageData.tableParams.loading = true;
  pageData.tableParams.columns = columns;
  const query = getQueryParams();
  patientApi.patientQueryList().then((res: any) => {
    if (res.success) {
      pageData.dataSource.patientList = res.result;
      console.log(pageData.dataSource.patientList);
    }
  });
  followApi
    .followQueryPending(query)
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
const handleBtnClick = (val: String) => {
  switch (val) {
    case "add":
      _handlerAdd();
      break;
    case "update":
      break;
    case "search":
      _updateSearchState();
      break;
    case "refresh":
      _loadData();
      break;
  }
};
/**
 * 新增
 */
const _handlerAdd = () => {
  radiationEditRef.value!.open("", "", pageData.dataSource);
};
const handleEdit = (data: any) => {
  radiationEditRef.value!.open(data, "更新随访记录", pageData.dataSource);
};
/**
 * 删除
 */
const handleDel = (record: any) => {
  message.confirm("确认删除当前数据").then(() => {
    _delete([record.id]);
  });
};
const _delete = (ids: any[]) => {
  if (ids && ids.length > 0) {
    pageData.tableParams.loading = true;
    followApi
      .del(ids)
      .then(res => {
        if (res.success) {
          message.success("删除成功");
          _loadData();
        } else {
          message.warning(res.message);
        }
      })
      .finally(() => {
        pageData.tableParams.loading = false;
      });
  }
};
// const handleAuthorize = (row: any) => {
//   rolePermissionRef.value!.open(row);
// };
onMounted(() => {
  _loadData();
});
defineOptions({ name: "sysRole" });
</script>

<template>
  <el-card :shadow="'never'">
    <template #default>
      <form-search
        :show="pageData.searchState"
        :form-field="pageData.searchField"
        :data-source="pageData.dataSource"
        @search-form="_updateSearchFormData"
        @search="_searchForm"
        @reset="_resetSearchForm"
        :query-permission="pageData.permission.query"
      />
      <table-buttons
        :size="'small'"
        :left-btns="pageData.btnOpts.left"
        :right-btns="pageData.btnOpts.right"
        @click="handleBtnClick"
      />
      <pure-table
        :columns="pageData.tableParams.columns"
        :data="pageData.tableParams.list"
        :border="true"
        :stripe="true"
        :loading="pageData.tableParams.loading"
        :pagination="pageData.tableParams.pagination"
        :header-row-class-name="'table-header'"
        @page-current-change="handleChangeCurrentPage"
        @page-size-change="handleChangePageSize"
      >
        <template #expand="{ row }">
          <div class="m-4">
            <h2>随访信息</h2>
            <br />
            <div>
              <h3>术后{{ row.afterSurgeryDate }}月随访记录</h3>
              <br />
              <!-- <p class="mb-2">手术日期: {{ row.surgeryDate }}</p> -->
              <p class="mb-2">随访日期: {{ row.followUpDate }}</p>
              <p class="mb-2">随访状态: {{ row.followUpStatus }}</p>
            </div>
            <br />
            <div>
              <h3>超声检查</h3>
              <br />
              <p class="mb-2">
                超声是否异常: {{ row.ultrasoundAbnormal ? "是" : "否" }}
              </p>
              <p class="mb-2">
                超声异常明细: {{ row.ultrasoundAbnormalDetail }}
              </p>
            </div>
            <br />
            <div>
              <h3>穿刺检查</h3>
              <br />
              <p class="mb-2">
                是否需进一步穿刺: {{ row.needFurtherBiopsy ? "是" : "否" }}
              </p>
              <p class="mb-2">穿刺结果: {{ row.biopsyResult }}</p>
            </div>
            <br />
            <div>
              <h3>其他检查</h3>
              <br />
              <p class="mb-2">是否有转移: {{ row.metastasis ? "是" : "否" }}</p>
              <p class="mb-2">转移部位: {{ row.metastasisLocation }}</p>
              <p class="mb-2">是否已故: {{ row.deceased ? "是" : "否" }}</p>
              <p class="mb-2">已故原因: {{ row.causeOfDeath }}</p>
              <p class="mb-2">
                是否术后患侧上肢水肿: {{ row.armEdema ? "是" : "否" }}
              </p>
              <p class="mb-2">
                是否行针对上肢水肿的治疗:
                {{ row.armEdemaTreatment ? "是" : "否" }}
              </p>
              <p class="mb-2">
                术后第{{ row.afterSurgeryDate }}月复查胸部CT是否异常:
                {{ row.chestCtAbnormal ? "是" : "否" }}
              </p>
              <p class="mb-2">
                术后第{{ row.afterSurgeryDate }}月复查头颅MR是否异常:
                {{ row.headMrAbnormal ? "是" : "否" }}
              </p>
              <p class="mb-2">
                术后第{{ row.afterSurgeryDate }}月复查全身骨扫描是否异常:
                {{ row.boneScanAbnormal ? "是" : "否" }}
              </p>
              <p class="mb-2">备注: {{ row.notes }}</p>
            </div>
            <br />
          </div>
        </template>
        <template #status="{ row }">
          <el-tag :type="getStatusTagType(row.followUpStatus)">
            {{ getStatusLabel(row.followUpStatus) }}
          </el-tag>
        </template>
        <template #sex="{ row }">
          <el-tag :type="row.sex === 1 ? 'success' : 'danger'">
            {{ row.sex === 1 ? "男" : "女" }}
          </el-tag>
        </template>
        <template #operation="{ row }">
          <!-- <el-link
            v-show="hasAuth(pageData.permission.update) && row.isSystem != 1"
            type="primary"
            @click="handleAuthorize(row)"
            >新增</el-link
          >
          <el-divider
            v-show="hasAuth(pageData.permission.update) && row.isSystem != 1"
            direction="vertical"
          /> -->
          <el-link
            v-show="hasAuth(pageData.permission.update) && row.isSystem !== 1"
            type="primary"
            @click="handleEdit(row)"
            >编辑</el-link
          >
          <el-divider
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            direction="vertical"
          />
          <el-link
            v-show="hasAuth(pageData.permission.delete) && row.isSystem !== 1"
            type="primary"
            @click="handleDel(row)"
            >删除</el-link
          >
        </template>
      </pure-table>
      <radiation-edit ref="radiationEditRef" @ok="_loadData" />
      <!-- <role-permission ref="rolePermissionRef" /> -->
    </template>
  </el-card>
</template>
