<!--
Copyright (c) 2025 Thomas Calmant
All rights reserved.

Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
-->

<template>
  <h2>{{ $t('helpTitle') }}</h2>
  <p>
    Please
    <a href="https://github.com/tcalmant/web-toolbox/issues">create an issue on GitHub</a> if you
    stumble upon an issue.
  </p>

  <h3>{{ $t('notamMapperTitle') }}</h3>

  <h3>{{ $t('fuelComputerTitle') }}</h3>
  <div>
    <p>
      The <strong>Fuel Computer</strong> helps track fuel consumption, added fuel, and estimated
      remaining fuel/time during flight. It supports in-flight decisions and pre-flight planning.
    </p>

    <h5>🔧 Input Fields</h5>
    <ul>
      <li><strong>Immatriculation</strong>: Aircraft ID or tail number.</li>
      <li><strong>Fuel Unit</strong>: Choose your preferred unit (e.g., Liters, Gallons).</li>
      <li><strong>Fuel Consumption</strong>: Average hourly fuel usage (e.g., 25 L/h).</li>
      <li><strong>Fuel Capacity</strong>: Total tank capacity.</li>
      <li><strong>Consumable Fuel</strong>: Total usable fuel in-flight.</li>
    </ul>

    <h5>📋 Displayed Results</h5>
    <ul>
      <li><strong>Total Flight Time</strong>: Duration of all logged flights.</li>
      <li><strong>Total Fuel Consumed</strong>: Based on flight time and fuel consumption.</li>
      <li><strong>Total Fuel Added</strong>: Sum of refueling entries.</li>
      <li><strong>Estimated Remaining Fuel</strong>: Added fuel minus consumed fuel.</li>
      <li><strong>Estimated Usable Fuel</strong>: Remaining fuel minus non-usable portion.</li>
      <li>
        <strong>Estimated Remaining Time</strong>: Estimated duration left with remaining usable
        fuel.
      </li>
    </ul>

    <p>
      ⚠️ <strong>Warnings:</strong> Yellow when less than 1 hour of usable fuel remains. <br />
      🔴 <strong>Alerts:</strong> Red when less than 30 minutes remain.
    </p>

    <h5>🕒 Flight Time Table</h5>
    <p>Log each flight block time, as indicated in the logbook.</p>

    <h5>⛽ Fuel Table</h5>
    <p>
      Record refueling events. Accurate totals support better fuel estimates. It is possible to
      enter a negative value if a fuel drain was performed.
    </p>
    <p>
      It is possible to select different unit of measurement for each entry, in order to match the
      indication found in foreign countries. Internally, all computations are done in Liters.
    </p>

    <h5>🖨️ Printing Options</h5>
    <ul>
      <li>Choose to include or hide input tables when printing.</li>
      <li>In portrait mode (on a smartphone): tables are tabbed.</li>
      <li>In landscape mode (on a computer): tables are side-by-side.</li>
    </ul>

    <h5>💾 Session Memory</h5>
    <p>
      The tool saves your session in local storage. When you return, your previous data is
      automatically restored.
    </p>
  </div>

  <h3>{{ $t('timestampTitle') }}</h3>
  <p>
    This component allows the user to convert between: a Unix timestamp, a UTC date, and a date in a
    chosen timezone. The values thus represent the same moment, in different formats.
  </p>

  <h4>Features</h4>
  <ul>
    <li>
      Support for UNIX timestamps in various units: nanoseconds, microseconds, milliseconds,
      seconds.
    </li>
    <li>Automatic detection of the most plausible unit.</li>
    <li>Timezone selection.</li>
  </ul>

  <h4>Timestamp Field</h4>
  <p>The <strong>Unix timestamp</strong> field is editable:</p>
  <ul>
    <li>The button on the left allows you to reset it to the current time.</li>
    <li>
      The dropdown menu allows you to force or detect the <strong>precision</strong> of the
      timestamp:
      <ul>
        <li>Automatic (based on the size of the timestamp)</li>
        <li>Seconds (<code>s</code>)</li>
        <li>Milliseconds (<code>ms</code>)</li>
        <li>Microseconds (<code>µs</code>)</li>
        <li>Nanoseconds (<code>ns</code>)</li>
      </ul>
    </li>
  </ul>

  <h4>UTC Date and Timezone</h4>
  <p>
    These fields display the Unix timestamp in <strong>Coordinated Universal Time (UTC)</strong> and
    in the <strong>selected timezone</strong>. It is possible to edit the date and time in order to
    update the Unix timestamp.
  </p>
</template>

<script setup lang="ts"></script>
