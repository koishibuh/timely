<script setup lang="ts">
import {onMounted, onUnmounted, ref, computed} from "vue";
import data from "./data/taskData.json";
import type {ITask, ITaskTime} from './data/task-interface.ts';

onMounted(() => {
  createSchedule(tasks.value);
  tick();

  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    tick();
    tickInterval = setInterval(tick, 60_000);
  }, msUntilNextMinute);
});

onUnmounted(() => {
  if (tickInterval) 
    clearInterval(tickInterval);
});

const DAY_START_HOUR = 6;
const DAY_END_HOUR = 22;
const DAY_TOTAL_MINUTES = (DAY_END_HOUR - DAY_START_HOUR) * 60;

const tasks = ref<ITask[]>(data);
const schedule = ref<ITaskTime[]>([]);

const currentTime = ref<string>("");
const currentMinutes = ref<number>(0);

const progress = ref<number>(0);
const currentTask = ref<ITaskTime | null>(null);

let tickInterval: ReturnType<typeof setInterval> | null = null;

const upcomingTasks = computed(() =>
    schedule.value.filter((t) => t.starttime > currentMinutes.value)
);

const nextTask = computed(() => upcomingTasks.value[0] ?? null);

const minutesUntilNext = computed(() => {
  return currentTask.value 
      ? Math.max(0, currentTask.value.endtime - currentMinutes.value) 
      : null;
});

const pad = (n: number) => String(n).padStart(2, "0");

const createSchedule = (tasks: ITask[]) => {
  let currentTime = DAY_START_HOUR * 60;

  for (const task of tasks) {
    const start = currentTime;
    const end = start + task.durationInMinutes;
    schedule.value.push({title: task.title, starttime: start, endtime: end});
    currentTime = end;
  }
};

const tick = () => {
  let now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  currentTime.value = `${pad(hours)}:${pad(minutes)}`;
  
  currentMinutes.value = hours * 60 + minutes;

  if (hours >= DAY_START_HOUR && hours <= DAY_END_HOUR) {
    const elapsed = (hours - DAY_START_HOUR) * 60 + minutes;
    const progressMade = (elapsed / DAY_TOTAL_MINUTES) * 100;
    if (progressMade > 100){
      progress.value = 0
    } else { progress.value = progressMade; }
  }

  currentTask.value =
      schedule.value.find(
          (t) => currentMinutes.value >= t.starttime && currentMinutes.value < t.endtime
      ) ?? null;
};

const taskWidthPercent = (durationInMinutes: number) =>
    (durationInMinutes / DAY_TOTAL_MINUTES) * 100;

const hourTicks = computed(() => {
  const ticks = [];
  for (let h = DAY_START_HOUR * 2; h <= DAY_END_HOUR * 2; h++) {
    ticks.push({hour: h, label: h});
  }
  return ticks;
});

const formatMinutes = (mins: number): string => {
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${mins}m`;
};
</script>

<template>
  <main class="px-2 text-white">
    <div class="text-center">
      <span class="text-4xl">{{ currentTime }}</span>
    </div>

    <div class="text-center">
      <div v-if=(currentTask)>
        <span class="">Currently {{ currentTask?.title ?? "—" }}</span> ➡️ <span :class="{ empty: !nextTask }">
          {{ minutesUntilNext != null ? ` ${formatMinutes(minutesUntilNext)} until` : "Up next" }}
          {{ nextTask?.title ?? "Done for the day" }}
      </span>
      </div>
    </div>

    <div>
      <div class="task-container">
        <div
            v-for="task in tasks"
            :key="task.id"
            class="flex items-center justify-center"
            :style="{
            backgroundColor: `#${task.color}`,
            width: `${taskWidthPercent(task.durationInMinutes)}%`,
          }"
            :title="task.title"
        >
          <span class="text-[11px]">{{ task.icon }}</span>
        </div>
      </div>

      <div class="h-[20px] bg-black relative">
        <div class="bg-blue-600 relative h-full" :style="{ width: `${progress}%` }">
          <span class="marker">⬆️</span>
        </div>
      </div>

      <div class="tick-container" :style="{ gridTemplateColumns: `repeat(${hourTicks.length - 1}, 1fr)` }">
        <div
            v-for="(tick, i) in hourTicks"
            :key="tick.hour"
            :class="{ 'tick-last': i === hourTicks.length - 1 }"
        >
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.task-container {
  display: flex;
  width: 100%;
  border-radius: 6px 6px 0 0;
  overflow: hidden;
  height: 28px;
}

.marker {
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  line-height: 1;
  filter: drop-shadow(0 0 6px rgba(79, 142, 247, 0.6));
}

.tick-container {
  display: grid;
  position: relative;
}

.tick-container > div:nth-child(odd) {
  height: 25px;
  width: 1px;
  background-color: #000000;
}

.tick-container > div:nth-child(even) {
  height: 15px;
  width: 1px;
  background-color: #000000;
}

.tick-last {
  position: absolute;
  right: 0;
  align-items: flex-end;
}
</style>