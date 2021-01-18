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
      </el-form-item>
    </el-form>
    <el-dialog
      :title="dialogTitle"
      :visible="dialogTableVisible"
      :modal-append-to-body="false"
      :show-close="true"
      :before-close="dialogCancel"
    >
      <pre
        style="white-space: pre-wrap; word-wrap: break-word; color: rgb(191, 203, 217); background-color: rgb(48, 65, 86);"
      >
        {{ dialogContent }}
      </pre>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogCancel">Cancel</el-button>
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
          <el-tag class="operation" type="blue" @click="remove(scope.row.id)">REMOVE</el-tag>
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
      dialogTableVisible: false,
      dialogTitle: '',
      dialogContent: '',
      clients: {}
    }
  },
  computed: {
    listFilter: function() {
      if (this.clients && this.server) {
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
    addcmd(id) {
      this.listLoading = true
      const params = {
        id: id
      }
      add(params).then(response => {
        // response.data.idx = idx
        // this.$set(this.list, idx, response.data)
        // this.listLoading = false
        // this.$message(this.list[idx].group + ' fresh!')
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
          this.clients[this.server] = this.clients[this.server].map((i, idx) => {
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
    }
  }
}
</script>
<style lang="scss" scoped>
.operation {
  cursor: pointer;
}
</style>
