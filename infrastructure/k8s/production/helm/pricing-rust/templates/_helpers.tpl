{{- define "autolytiq-pricing-rust.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "autolytiq-pricing-rust.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "autolytiq-pricing-rust.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "autolytiq-pricing-rust.labels" -}}
helm.sh/chart: {{ include "autolytiq-pricing-rust.chart" . }}
{{ include "autolytiq-pricing-rust.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "autolytiq-pricing-rust.selectorLabels" -}}
app.kubernetes.io/name: {{ include "autolytiq-pricing-rust.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
