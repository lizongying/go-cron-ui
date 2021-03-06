<template>
  <div class="app-container">
    <el-form>
      <el-form-item>
        <el-select v-model="server" placeholder="server">
          <el-option v-for="item in servers" :key="item" :label="item" :value="item" />
        </el-select>
        <div style="position: relative; display: inline-block; width: 195px">
          <el-select v-model="rule" placeholder="group" style="position: absolute; left: 0">
            <el-option v-for="item in rules" :key="item" :label="item" :value="item" />
          </el-select>
          <el-input v-model="rule" clearable placeholder="group" style="width: 160px" />
        </div>
        <el-button type="primary" @click="onSave">Save filter</el-button>
        <el-button @click="onDelete">Delete filter</el-button>
        <el-button type="primary" style="float: right" @click="dialogAdd">Add</el-button>
      </el-form-item>
    </el-form>
    <el-dialog
      :title="dialogTitle"
      :visible="dialogTableVisible"
      :modal-append-to-body="false"
      :show-close="true"
      :before-close="dialogCancel"
    >
      <el-form ref="form" :model="form" :rules="rulesForm">
        <el-form-item label="Script" prop="script" :label-width="formLabelWidth">
          <el-input v-model="form.script" type="textarea" :style="inputWidth" placeholder="Script" />
        </el-form-item>
        <el-form-item label="Dir" prop="dir" :label-width="formLabelWidth">
          <el-input v-model="form.dir" :style="inputWidth" placeholder="Dir" />
        </el-form-item>
        <el-form-item label="Spec" prop="spec" :label-width="formLabelWidth">
          <el-input v-model="form.spec" :style="inputWidth" placeholder="Spec" />
        </el-form-item>
        <el-form-item label="Group" prop="group" :label-width="formLabelWidth">
          <el-input v-model="form.group" :style="inputWidth" placeholder="Group" />
        </el-form-item>
        <el-form-item label="Enable" prop="enable" :label-width="formLabelWidth">
          <el-switch v-model="form.enable" :style="inputWidth" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel">Cancel</el-button>
        <el-button type="primary" @click="dialogSure">Save</el-button>
      </div>
    </el-dialog>
    <el-table
      v-loading="listLoading"
      :data="listFilter"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      :default-sort="{prop: 'id', order: 'ascending'}"
    >
      <el-table-column label="ID" width="50" align="center" fixed="left">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column prop="id" sortable label="TaskID">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column prop="script" sortable label="Script">
        <template slot-scope="scope">
          {{ scope.row.script }}
        </template>
      </el-table-column>
      <el-table-column prop="dir" sortable label="Dir">
        <template slot-scope="scope">
          {{ scope.row.dir }}
        </template>
      </el-table-column>
      <el-table-column prop="spec" sortable label="Spec">
        <template slot-scope="scope">
          {{ scope.row.spec }}
        </template>
      </el-table-column>
      <el-table-column prop="group" sortable label="Group">
        <template slot-scope="scope">
          {{ scope.row.group }}
        </template>
      </el-table-column>
      <el-table-column prop="prev" sortable label="Prev" width="190" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          {{ scope.row.prev }}
        </template>
      </el-table-column>
      <el-table-column prop="next" sortable label="Next" width="190" align="center">
        <template slot-scope="scope">
          <i class="el-icon-time" />
          {{ scope.row.next }}
        </template>
      </el-table-column>
      <el-table-column prop="state" sortable label="JobState" width="120" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.state | statusFilter">{{ scope.row.state }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enable" sortable label="Enable" width="120" align="center">
        <template slot-scope="scope">
          <el-tag class="operation" :type="scope.row.enable | statusFilter" @click="enable(scope.row.enable, scope.row.id)">{{ scope.row.enable }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Operation" width="200" align="center" fixed="right">
        <template slot-scope="scope">
          <el-tag class="operation" type="blue" @click="remove(scope.row.id)">Remove</el-tag>
          <el-tag type="blue" class="operation" @click="dialogUpdate(scope.row.id)">Edit</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { add, list, remove, stop, start } from '@/api/cron'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        RUN: 'success',
        DEF: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      RUN: 'RUN',
      DEF: 'DEF',
      list: [],
      listLoading: true,
      rule: '.*',
      rules: new Set(['.*']),
      server: '',
      servers: [],
      formLabelWidth: '100px',
      inputWidth: 'width:100%;',
      dialogTableVisible: false,
      dialogTitle: '',
      dialogContent: '',
      form: {
        id: '',
        script: '',
        dir: '',
        spec: '',
        group: '',
        enable: true
      },
      rulesForm: {
        script: [
          { required: true, message: 'Script is empty', trigger: 'blur' }
        ],
        spec: [
          { required: true, message: 'Spec is empty', trigger: 'blur' }
        ]
      },
      clients: {},
      ids: []
    }
  },
  computed: {
    listFilter: function() {
      if (this.clients && this.server && this.clients[this.server]) {
        const re = new RegExp(this.rule)
        return this.clients[this.server].filter((item) => {
          return re.test(item.group)
        })
      } else {
        return []
      }
    }
  },
  mounted() {
    if (localStorage.rules && localStorage.rules !== '{}') {
      this.rules = new Set(JSON.parse(localStorage.rules))
    }
    if (localStorage.rule) {
      this.rule = localStorage.rule
    }
    if (localStorage.server) {
      this.server = localStorage.server
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      const params = {}
      list(params).then(response => {
        this.clients = response.data
        this.servers = Object.keys(response.data)
        if (this.servers.length) {
          this.server = this.servers[0]
        }
        this.listLoading = false
      })
    },
    fresh(idx) {
      this.listLoading = true
      const params = {
        server: this.server,
        group: this.list[idx].group,
        name: this.list[idx].name
      }
      status(params).then(response => {
        response.data.idx = idx
        this.$set(this.list, idx, response.data)
        this.listLoading = false
        this.$message(this.list[idx].group + ' fresh!')
      })
    },
    remove(id) {
      this.listLoading = true
      const params = {
        id: id
      }
      remove(params).then(response => {
        this.clients[this.server] = this.clients[this.server].filter((i) => {
          return i.id !== id
        }
        )
        this.listLoading = false
        this.$message('removed: ' + id)
      })
    },
    enable(e, id) {
      this.listLoading = true
      const params = {
        id: id
      }
      if (e) {
        stop(params).then(response => {
          this.clients[this.server] = this.clients[this.server].map((i) => {
            if (i.id === id) {
              i.enable = false
            }
            return i
          }
          )
          this.listLoading = false
          this.$message('stopped: ' + id)
        })
      } else {
        start(params).then(response => {
          this.clients[this.server] = this.clients[this.server].map((i) => {
            if (i.id === id) {
              i.enable = true
            }
            return i
          }
          )
          this.listLoading = false
          this.$message('started: ' + id)
        })
      }
    },
    onSave: function() {
      this.rules.add(this.rule)
      this.rules = new Set(Array.from(this.rules))
      localStorage.rules = JSON.stringify(Array.from(this.rules))
      localStorage.rule = this.rule
      localStorage.server = this.server
    },
    onDelete: function() {
      this.rules.delete(this.rule)
      this.rules = new Set(Array.from(this.rules))
      localStorage.rules = JSON.stringify(Array.from(this.rules))
      this.rule = '.*'
      localStorage.rule = this.rule
      this.server = this.servers[0]
      localStorage.server = this.servers[0]
    },
    dialogCancel: function() {
      this.dialogTableVisible = false
    },
    dialogAdd: function() {
      this.form = {
        id: '',
        script: '',
        dir: '',
        spec: '',
        group: '',
        enable: true
      }
      this.dialogTitle = 'Add'
      this.dialogTableVisible = true
    },
    dialogUpdate: function(id) {
      this.clients[this.server].every((i) => {
        if (i.id === id) {
          this.form = {
            id: i.id,
            script: i.script,
            dir: i.dir,
            spec: i.spec,
            group: i.group,
            enable: i.enable
          }
          return false
        }
        return true
      })

      this.dialogTitle = 'Edit'
      this.dialogTableVisible = true
    },
    dialogSure: function() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.listLoading = true
          const params = this.form
          if (!this.form.id) {
            params.id = 3
            add(params).then(response => {
              this.listLoading = false
              if (response.code === 0) {
                this.clients[this.server].push({
                  id: params.id,
                  script: params.script,
                  dir: params.dir,
                  spec: params.spec,
                  group: params.group,
                  prev: '0000-00-00 00:00:00',
                  next: '0000-00-00 00:00:00',
                  state: 'DEF',
                  enable: params.enable
                })
                this.$message('Success')
              } else {
                this.$message('Error')
              }
              this.dialogTableVisible = false
            })
          } else {
            add(params).then(response => {
              this.listLoading = false
              if (response.code === 0) {
                this.clients[this.server] = this.clients[this.server].map((i) => {
                  if (i.id === params.id) {
                    i.script = params.script
                    i.dir = params.dir
                    i.spec = params.spec
                    i.group = params.group
                    i.prev = params.prev
                    i.next = params.next
                    i.state = params.state
                    i.enable = params.enable
                  }
                  return i
                })
                this.$message('Success')
              } else {
                this.$message('Error')
              }
              this.dialogTableVisible = false
            })
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.operation {
  cursor: pointer;
}
</style>
