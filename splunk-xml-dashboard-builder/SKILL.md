---
name: splunk-xml-dashboard-builder
description: Build Splunk Simple XML dashboards from SPL queries, hunt findings, and analysis context. Specializes in security operations dashboards, threat hunting dashboards, and operational monitoring dashboards. Use when you have SPL queries and analysis results that need to be visualized in a Splunk dashboard that can be deployed directly to a Splunk instance.
---

# Splunk Simple XML Dashboard Builder

Build production-quality Splunk dashboards using Simple XML. This skill covers dashboard design principles, complete XML reference, visualization selection, panel configuration, interactivity with form inputs, and layout best practices for security operations and threat hunting.

## When to Use This Skill

- You have SPL queries that need dashboard visualization
- You're building threat hunting dashboards
- You're creating operational monitoring dashboards
- You need security operations center (SOC) dashboards
- You want to share analysis results as interactive Splunk dashboards
- You're building dashboards that can be deployed to a Splunk instance

## Dashboard Design Principles

### Layout Philosophy
- **Top-down narrative**: Dashboards should tell a story from summary to detail
- **Row 1**: High-level KPIs and single values (the "so what")
- **Row 2**: Trends and time-series charts (the "over time" view)
- **Row 3+**: Detailed tables and drill-down panels (the "show me the data")
- **Use 1-3 panels per row** for readability; never exceed 4
- **Group related panels** in the same row

### Visualization Selection Guide

| Data Pattern | Best Visualization | Simple XML Element |
|---|---|---|
| Single metric / KPI | Single Value | `<single>` |
| Metric over time | Line or Area chart | `<chart>` type=line/area |
| Category comparison | Column or Bar chart | `<chart>` type=column/bar |
| Proportions / share | Pie chart | `<chart>` type=pie |
| Detailed records | Statistics Table | `<table>` |
| Raw events | Events list | `<event>` |
| Geographic data | Map | `<map>` |
| Threshold / status | Gauge | `<chart>` type=radialGauge/fillerGauge |
| Trend with target | Single Value + trend | `<single>` with timechart |

### Color and Formatting
- Use `rangeValues` and `rangeColors` on single values to indicate severity:
  - Green (`0x65a637`): Normal / good
  - Yellow (`0xf2b827`): Warning / elevated
  - Orange (`0xf58f39`): High
  - Red (`0xd93f3c`): Critical
- For security dashboards, use red-first color schemes for threats
- Apply `charting.fieldColors` to assign semantic colors to known categories
- Use `colorMode="block"` on single values for high-visibility KPIs

### Interactivity
- Add `<drilldown>` to tables and charts for analyst investigation workflows
- Use token-based filtering with `<form>` inputs when the dashboard serves multiple use cases
- Use `depends` and `rejects` attributes to show/hide panels conditionally
- Add time picker inputs for flexible time range selection

---

## Simple XML Reference

### Root Elements

**Dashboard** (static, no user inputs):
```xml
<dashboard version="1.1">
  <label>Dashboard Title</label>
  <description>Optional description</description>
  <row>...</row>
</dashboard>
```

**Form** (has user inputs):
```xml
<form version="1.1">
  <label>Form Title</label>
  <description>Optional description</description>
  <fieldset submitButton="true" autoRun="true">
    <input type="time" token="time_tok">
      <label>Time Range</label>
      <default>
        <earliest>-24h@h</earliest>
        <latest>now</latest>
      </default>
    </input>
  </fieldset>
  <row>...</row>
</form>
```

Use `<form>` whenever the dashboard benefits from user-selectable filters (time range, sourcetype, host, etc.). For security dashboards, almost always use `<form>` with at least a time picker.

### Key Attributes on Root Element

| Attribute | Type | Default | Purpose |
|---|---|---|---|
| `version` | string | 1.1 | Always use `"1.1"` for jQuery 3.5+ compatibility |
| `theme` | string | light | Use `"dark"` for SOC/NOC displays |
| `refresh` | integer | 0 | Auto-refresh interval in seconds (use for live monitoring) |
| `hideEdit` | boolean | false | Set `"true"` for production dashboards |

### Structure Elements

**Row**: `<row>` contains one or more `<panel>` elements.
```xml
<row>
  <panel>...</panel>
  <panel>...</panel>
</row>
```

Attributes: `depends="$token$"`, `rejects="$token$"`, `id="row_id"`

**Panel**: Contains visualizations and optional base searches.
```xml
<panel>
  <title>Panel Title</title>
  <single>...</single>
</panel>
```

Attributes: `depends`, `rejects`, `ref` (for prebuilt panels), `id`

### Search Element

Inline search:
```xml
<search>
  <query>index=main sourcetype=firewall | stats count by action</query>
  <earliest>-24h@h</earliest>
  <latest>now</latest>
</search>
```

Base search with post-process:
```xml
<search id="baseSearch">
  <query>index=main | stats count by sourcetype, action</query>
  <earliest>$time_tok.earliest$</earliest>
  <latest>$time_tok.latest$</latest>
</search>

<!-- Post-process in a panel -->
<search base="baseSearch">
  <query>stats sum(count) as total by action</query>
</search>
```

Report reference:
```xml
<search ref="my_saved_report" />
```

Search with refresh:
```xml
<search>
  <query>...</query>
  <earliest>-15m</earliest>
  <latest>now</latest>
  <refresh>60</refresh>
  <refreshType>delay</refreshType>
</search>
```

Search event handlers (for dynamic behavior):
```xml
<search id="mySearch">
  <query>...</query>
  <done>
    <condition match="'job.resultCount' == 0">
      <set token="no_results">true</set>
    </condition>
    <condition>
      <unset token="no_results" />
    </condition>
  </done>
</search>
```

### Visualization Elements

#### Single Value (`<single>`)
```xml
<single>
  <title>Total Events</title>
  <search>
    <query>index=main | stats count</query>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </search>
  <option name="colorMode">block</option>
  <option name="drilldown">all</option>
  <option name="rangeColors">["0x65a637","0x6db7c6","0xf58f39","0xd93f3c"]</option>
  <option name="rangeValues">[0,100,500]</option>
  <option name="underLabel">events</option>
  <option name="useColors">1</option>
  <option name="showSparkline">true</option>
  <option name="showTrendIndicator">true</option>
  <option name="trendDisplayMode">percent</option>
  <option name="unit">events</option>
  <option name="unitPosition">after</option>
</single>
```

Key options: `colorBy` (value|trend), `colorMode` (block|none), `useColors`, `rangeValues`, `rangeColors`, `showSparkline`, `showTrendIndicator`, `trendDisplayMode` (percent|absolute), `field`, `underLabel`, `unit`, `unitPosition` (before|after), `numberPrecision`, `useThousandSeparators`.

For sparkline/trend: search must use `timechart` command.

#### Chart (`<chart>`)
```xml
<chart>
  <title>Events Over Time</title>
  <search>
    <query>index=main | timechart count by sourcetype</query>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </search>
  <option name="charting.chart">line</option>
  <option name="charting.axisY.scale">log</option>
  <option name="charting.legend.placement">bottom</option>
  <option name="charting.chart.nullValueMode">connect</option>
  <option name="height">300</option>
</chart>
```

**Chart types**: `area`, `bar`, `bubble`, `column`, `fillerGauge`, `line`, `markerGauge`, `pie`, `radialGauge`, `scatter`

**Common chart options**:
- `charting.chart` — Chart type
- `charting.legend.placement` — top, left, bottom, right, none
- `charting.axisY.scale` — linear, log
- `charting.axisX.scale` — linear, log (scatter/bubble only)
- `charting.axisTitleX.text` / `charting.axisTitleY.text` — Axis labels
- `charting.chart.stackMode` — default, stacked, stacked100
- `charting.chart.showDataLabels` — all, minmax, none
- `charting.chart.nullValueMode` — gaps, zero, connect (line/area)
- `charting.chart.showMarkers` — true/false (line charts)
- `charting.fieldColors` — `{"ERROR": 0xFF0000, "WARN": 0xFF9900}`
- `charting.seriesColors` — `[0x1e93c6, 0xf2b827, 0xd6563c, ...]`
- `charting.drilldown` — all, none
- `height` — 100 to 10000 (default 250)

**Area-specific**: `charting.areaFillOpacity` (0-1.0), `charting.chart.showLines`

**Line-specific**: `charting.lineWidth`, `charting.lineDashStyle`, `charting.chart.showMarkers`

**Overlay (area/column/line)**: `charting.axisY2.enabled`, `charting.axisY2.fields`, `charting.chart.overlayFields`, `charting.axisY2.scale`

**Gauge-specific**: `charting.chart.rangeValues`, `charting.gaugeColors`, `charting.chart.style` (minimal|shiny)

**Pie-specific**: `charting.chart.showPercent`, `charting.chart.sliceCollapsingThreshold`

#### Table (`<table>`)
```xml
<table>
  <title>Top Events</title>
  <search>
    <query>index=main | stats count by sourcetype | sort -count</query>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </search>
  <option name="count">10</option>
  <option name="drilldown">cell</option>
  <option name="rowNumbers">true</option>
  <option name="wrap">true</option>
  <option name="dataOverlayMode">heatmap</option>
  <fields>sourcetype, count</fields>
</table>
```

Key options: `count`, `drilldown` (cell|row|none), `rowNumbers`, `wrap`, `showPager`, `dataOverlayMode` (none|heatmap|highlow), `totalsRow`, `percentagesRow`.

Column formatting (inside `<table>`):
```xml
<format type="color" field="count">
  <colorPalette type="minMidMax" maxColor="#DC4E41" midColor="#F8BE34" minColor="#53A051" />
</format>
<format type="number" field="count">
  <option name="precision">0</option>
  <option name="useThousandSeparators">true</option>
</format>
```

Sparklines in tables:
```xml
<format type="sparkline" field="trend">
  <option name="type">bar</option>
  <option name="height">40</option>
  <option name="barWidth">5px</option>
  <option name="colorMap">
    <option name="2000:">#5379AF</option>
    <option name=":1999">#9ac23c</option>
  </option>
</format>
```

#### Event (`<event>`)
```xml
<event>
  <search>
    <query>index=main sourcetype=syslog ERROR</query>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </search>
  <option name="count">20</option>
  <option name="list.drilldown">full</option>
  <option name="type">list</option>
  <option name="maxLines">5</option>
  <fields>_time, host, source, _raw</fields>
</event>
```

Options: `type` (list|raw|table), `count`, `list.drilldown` (full|inner|outer|none), `list.wrap`, `maxLines`, `rowNumbers`, `showPager`.

#### Map (`<map>`)
```xml
<map>
  <search>
    <query>index=main | iplocation src_ip | geostats count by Country</query>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </search>
  <option name="mapping.type">marker</option>
  <option name="mapping.map.zoom">3</option>
  <option name="drilldown">all</option>
</map>
```

Cluster map: `mapping.type=marker`. Choropleth: `mapping.type=choropleth`.

#### HTML (`<html>`)
```xml
<html>
  <h3>Investigation Notes</h3>
  <p>This dashboard shows results from hunt <b>$hunt_id$</b></p>
</html>
```

Supports tokens when `tokens="true"` (default). Use for instructions, context panels, and conditional messaging.

### Form Inputs

#### Time Picker
```xml
<input type="time" token="time_tok">
  <label>Time Range</label>
  <default>
    <earliest>-24h@h</earliest>
    <latest>now</latest>
  </default>
</input>
```

Use `$time_tok.earliest$` and `$time_tok.latest$` in search `<earliest>` / `<latest>`.

#### Dropdown
```xml
<input type="dropdown" token="sourcetype_tok" searchWhenChanged="true">
  <label>Sourcetype</label>
  <choice value="*">All</choice>
  <default>*</default>
  <search>
    <query>| metadata type=sourcetypes index=main | table sourcetype</query>
  </search>
  <fieldForLabel>sourcetype</fieldForLabel>
  <fieldForValue>sourcetype</fieldForValue>
</input>
```

#### Text Input
```xml
<input type="text" token="search_term">
  <label>Search Term</label>
  <default>*</default>
  <prefix>*</prefix>
  <suffix>*</suffix>
</input>
```

#### Radio Buttons
```xml
<input type="radio" token="chart_type" searchWhenChanged="true">
  <label>View</label>
  <choice value="line">Line</choice>
  <choice value="column">Column</choice>
  <choice value="area">Area</choice>
  <default>line</default>
</input>
```

#### Multiselect
```xml
<input type="multiselect" token="hosts_tok" searchWhenChanged="true">
  <label>Hosts</label>
  <choice value="*">All</choice>
  <default>*</default>
  <delimiter> OR </delimiter>
  <valuePrefix>host="</valuePrefix>
  <valueSuffix>"</valueSuffix>
  <search>
    <query>| metadata type=hosts index=main | table host</query>
  </search>
  <fieldForLabel>host</fieldForLabel>
  <fieldForValue>host</fieldForValue>
</input>
```

#### Checkbox
```xml
<input type="checkbox" token="status_tok" searchWhenChanged="true">
  <label>Status</label>
  <choice value="allowed">Allowed</choice>
  <choice value="blocked">Blocked</choice>
  <delimiter> OR </delimiter>
  <valuePrefix>action="</valuePrefix>
  <valueSuffix>"</valueSuffix>
</input>
```

### Drilldown

Basic link:
```xml
<drilldown>
  <link target="_blank">/app/search/search?q=$click.value$</link>
</drilldown>
```

Conditional drilldown with token setting:
```xml
<drilldown>
  <condition field="sourcetype">
    <set token="selected_sourcetype">$click.value2$</set>
  </condition>
  <condition field="*">
    <link>/app/search/search?q=index=main $click.value2$</link>
  </condition>
</drilldown>
```

In-page drilldown (show detail panel):
```xml
<!-- In table -->
<drilldown>
  <set token="selected_host">$row.host$</set>
  <set token="show_detail">true</set>
</drilldown>

<!-- Detail panel appears when token is set -->
<panel depends="$show_detail$">
  <title>Details for $selected_host$</title>
  <table>
    <search>
      <query>index=main host=$selected_host$ | head 100</query>
    </search>
  </table>
</panel>
```

### Predefined Drilldown Tokens

**Table**: `$click.name$` (leftmost field name), `$click.value$` (leftmost field value), `$click.name2$` (clicked column name), `$click.value2$` (clicked cell value), `$row.<fieldname>$` (any field from clicked row), `$earliest$`, `$latest$`.

**Chart**: `$click.name$` (x-axis field), `$click.value$` (x-axis value), `$click.name2$` (y-axis/series name), `$click.value2$` (y-axis value), `$row.<fieldname>$`, `$earliest$`, `$latest$`.

**Single**: `$click.name$`, `$click.value$`, `$row.<fieldname>$`, `$earliest$`, `$latest$`.

**Map**: `$click.name$`, `$click.value$`, `$click.lat.value$`, `$click.lon.value$`, `$click.bounds.<orientation>$`, `$row.<fieldname>$`.

### Token Filters

Use within `$token|filter$`:
- `|s` — Wrap value in quotes (for string values in SPL)
- `|h` — HTML-encode
- `|u` — URL-encode
- `|n` — No encoding (raw)

### Init Block

Set tokens on page load:
```xml
<form>
  <init>
    <set token="show_overview">true</set>
  </init>
  ...
</form>
```

### Base Searches (Performance Optimization)

When multiple panels use variations of the same query, use a base search:
```xml
<search id="base_traffic">
  <query>index=firewall | stats count by src_ip, dest_ip, action</query>
  <earliest>$time_tok.earliest$</earliest>
  <latest>$time_tok.latest$</latest>
</search>

<!-- Panel 1: post-process -->
<chart>
  <search base="base_traffic">
    <query>stats sum(count) as total by action</query>
  </search>
</chart>

<!-- Panel 2: post-process -->
<table>
  <search base="base_traffic">
    <query>sort -count | head 20</query>
  </search>
</table>
```

Rules: Base search MUST use transforming commands. Post-process searches inherit `<earliest>` and `<latest>` from the base (they cannot override them).

---

## Dashboard Assembly Workflow

### Step 1: Analyze Input

Review the SPL queries and context provided. For each query, determine:
- What question does it answer?
- What fields does it produce?
- What visualization best represents the results?
- Does it need to be interactive (drilldown, token filtering)?
- What time range is appropriate?

### Step 2: Plan the Layout

Sketch the dashboard structure:
```
Row 1: [KPI Single Values - 3-4 panels]
Row 2: [Time-series Charts - 1-2 panels]
Row 3: [Detail Tables - 1-2 panels]
Row 4: [Conditional detail / drilldown panels]
```

### Step 3: Optimize Queries

- If multiple panels query the same index with similar filters, create a base search
- Ensure all queries use transforming commands (`stats`, `timechart`, `chart`, `top`, `rare`, etc.) for visualizations (except `<event>` panels)
- Add appropriate time bounds
- Use tokens for user-configurable parameters

### Step 4: Assemble the XML

Build the dashboard following these rules:
1. Always use `version="1.1"` on the root element
2. Add `<label>` and `<description>` for documentation
3. Use `<form>` with at least a time picker for any analytical dashboard
4. Apply consistent formatting options across similar visualizations
5. Add drilldown to tables and charts
6. Include HTML panels for context where helpful

### Step 5: Validate

Check the XML for:
- Well-formed XML (properly nested, closed tags)
- All tokens referenced are defined (inputs or drilldown sets)
- Base search IDs match post-process `base` attributes
- Time range tokens are correctly wired to searches
- No duplicate element IDs
- Appropriate `version="1.1"` on root element

### Step 6: Test

**If Splunk MCP server is available**:
- Run each SPL query individually to verify they return data
- Check that field names in the results match what the visualizations expect

### Step 7: Deliver

Provide:
1. The complete Simple XML source code
2. A summary of what each panel shows
3. Deployment instructions:
   - Via Splunk Web: Settings > User Interface > Views > New View
   - Via filesystem: Save as `$SPLUNK_HOME/etc/apps/<app>/local/data/ui/views/<dashboard_name>.xml`
   - Via REST API: `POST /servicesNS/<owner>/<app>/data/ui/views`

---

## Security Dashboard Patterns

### Threat Hunt Results Dashboard
```
Row 1: Total findings (single) | Critical findings (single) | Time range covered (single)
Row 2: Findings over time (timechart) | Findings by severity (pie)
Row 3: Detailed findings table with drilldown
Row 4: Raw event viewer (depends on drilldown selection)
```

### SOC Monitoring Dashboard
```
Row 1: Open alerts (single) | Critical (single) | Mean time to respond (single)
Row 2: Alert trend (timechart) | Top alert types (bar)
Row 3: Alert queue table with severity coloring
```

### Network Security Dashboard
```
Row 1: Total connections (single) | Blocked (single) | Unique sources (single)
Row 2: Traffic over time by action (area, stacked) | Top talkers (bar)
Row 3: Connection detail table | Geographic map of sources
```

### Authentication Monitoring Dashboard
```
Row 1: Total logins (single) | Failed (single, red threshold) | Unique users (single)
Row 2: Auth events over time (timechart) | Failed by reason (pie)
Row 3: Failed login detail table with user drilldown
Row 4: User activity timeline (depends on selection)
```

---

## Common Pitfalls to Avoid

1. **Missing transforming commands**: Visualizations (except `<event>`) need `stats`, `timechart`, `chart`, `top`, `rare`, or similar
2. **Token not defined**: Every `$token$` in a search must have a corresponding `<input>`, `<set>`, or `<init>` that defines it
3. **Post-process without base ID**: `<search base="X">` requires a `<search id="X">` to exist
4. **Time range on post-process**: Post-process searches inherit time from their base; specifying `<earliest>`/`<latest>` on a post-process is ignored
5. **Special characters in XML**: Use `<![CDATA[...]]>` for URLs with `&` in `<link>` elements
6. **Missing version attribute**: Always use `version="1.1"` to ensure jQuery 3.5+ compatibility
7. **Overly complex single search**: Break complex queries into base + post-process for maintainability
8. **No error handling**: Use `<done>` with `<condition match="'job.resultCount' == 0">` to show "no results" messages

---

## Deployment

Simple XML dashboards can be deployed by:

**Via Splunk Web UI**:
1. Navigate to Settings > User Interface > Views
2. Click "New View"
3. Name the dashboard and select the app
4. Click "Create View"
5. Edit the view source and paste your XML

**Via Filesystem**:
1. Save the XML file to: `$SPLUNK_HOME/etc/apps/<app_name>/local/data/ui/views/<dashboard_name>.xml`
2. Restart Splunk or refresh the app
3. Navigate to the dashboard in the app

**Via REST API**:
```bash
curl -k -u admin:password \
  https://localhost:8089/servicesNS/nobody/<app_name>/data/ui/views \
  -d name=<dashboard_name> \
  -d "eai:data=<xml_content>"
```

**Via Version Control**:
- Store dashboard XML in git repository
- Use CI/CD pipelines to deploy to Splunk instances
- Integrate with Splunk app packaging workflows
